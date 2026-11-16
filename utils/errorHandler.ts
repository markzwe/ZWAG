// Centralized error handling and logging utilities
import { ZwagError } from "@/types";
import { ERROR_CODES } from "@/constants/app";

// ==================== LOGGING UTILITY ====================
class Logger {
  private static isDev = __DEV__;

  static info(message: string, data?: Record<string, unknown>): void {
    if (this.isDev) {
      console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  static warn(message: string, data?: Record<string, unknown>): void {
    if (this.isDev) {
      console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  static error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    if (this.isDev) {
      console.error(`[ERROR] ${message}`, error, data ? JSON.stringify(data, null, 2) : '');
    }
    // In production, you might want to send this to a crash reporting service
    // like Sentry, Bugsnag, etc.
  }

  static debug(message: string, data?: Record<string, unknown>): void {
    if (this.isDev) {
      console.debug(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
}

// ==================== ERROR HANDLER ====================
export class ErrorHandler {
  static createError(code: string, message: string, details?: Record<string, unknown>): ZwagError {
    Logger.error(`Creating error: ${code}`, undefined, { message, details });
    return new ZwagError(code, message, details);
  }

  static handleNetworkError(error: unknown): ZwagError {
    Logger.error("Network error occurred", error);
    return this.createError(
      ERROR_CODES.NETWORK_ERROR,
      "Network connection failed. Please check your internet connection and try again.",
      { originalError: error }
    );
  }

  static handleAIGenerationError(error: unknown): ZwagError {
    Logger.error("AI generation failed", error);
    return this.createError(
      ERROR_CODES.AI_GENERATION_FAILED,
      "Failed to generate outfit. Please try again.",
      { originalError: error }
    );
  }

  static handleInvalidItemId(itemId: string): ZwagError {
    Logger.error("Invalid item ID", undefined, { itemId });
    return this.createError(
      ERROR_CODES.INVALID_ITEM_ID,
      "Invalid item selected. Please refresh and try again.",
      { itemId }
    );
  }

  static handleVisionKitUnavailable(): ZwagError {
    Logger.warn("VisionKit unavailable");
    return this.createError(
      ERROR_CODES.VISION_KIT_UNAVAILABLE,
      "Background removal is not available on this device. iOS 16+ is required.",
      { requirement: "iOS 16+" }
    );
  }

  static handleImageProcessingError(error: unknown): ZwagError {
    Logger.error("Image processing failed", error);
    return this.createError(
      ERROR_CODES.IMAGE_PROCESSING_FAILED,
      "Failed to process image. Please try with a different image.",
      { originalError: error }
    );
  }

  static handleCacheError(error: unknown): ZwagError {
    Logger.error("Cache operation failed", error);
    return this.createError(
      ERROR_CODES.CACHE_ERROR,
      "Cache operation failed. Data may not be up to date.",
      { originalError: error }
    );
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof ZwagError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred";
  }

  static isNetworkError(error: unknown): boolean {
    if (error instanceof ZwagError) {
      return error.code === ERROR_CODES.NETWORK_ERROR;
    }
    return false;
  }
}

// ==================== ASYNC WRAPPER ====================
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorHandler?: (error: unknown) => ZwagError
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (errorHandler) {
      throw errorHandler(error);
    }
    throw ErrorHandler.createError(
      "UNKNOWN_ERROR",
      ErrorHandler.getErrorMessage(error),
      { originalError: error }
    );
  }
}

// ==================== RETRY UTILITY ====================
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      Logger.warn(`Operation failed, attempt ${attempt}/${maxRetries}`, { error });
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}

export { Logger };
