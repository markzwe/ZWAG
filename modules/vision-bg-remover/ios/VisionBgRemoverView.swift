import ExpoModulesCore
import UIKit
import Vision
import CoreImage
#if canImport(VisionKit)
import VisionKit
#endif

// Single view class that handles iOS version compatibility internally
class VisionBgRemoverView: ExpoView {
  let onProcessingComplete = EventDispatcher()
  let onProcessingError = EventDispatcher()
  
  private var imageView: UIImageView!
  private var originalImage: UIImage?
  private var isVisionKitAvailable: Bool {
    if #available(iOS 17.0, *) {
      return true
    } else {
      return false
    }
  }
  
  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupView()
  }
  
  private func setupView() {
    // Different colors based on iOS version support
    if isVisionKitAvailable {
      backgroundColor = UIColor.red // VisionKit available
      print("🔍 VisionBgRemoverView initialized with iOS 17+ VisionKit support")
    } else {
      backgroundColor = UIColor.orange // Fallback mode
      print("🔍 VisionBgRemoverView initialized in fallback mode (iOS < 17)")
    }
    
    layer.cornerRadius = 12
    clipsToBounds = true
    
    imageView = UIImageView()
    imageView.contentMode = .scaleAspectFit
    imageView.backgroundColor = UIColor.lightGray
    addSubview(imageView)
    
    // Add fallback label if VisionKit not available
    if !isVisionKitAvailable {
      let label = UILabel()
      label.text = "iOS < 17\nVisionKit not available"
      label.textAlignment = .center
      label.numberOfLines = 0
      label.font = UIFont.systemFont(ofSize: 14)
      label.textColor = UIColor.black
      label.tag = 999 // Tag for easy identification
      addSubview(label)
    }
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    imageView.frame = bounds
    
    // Position fallback label if present
    if let label = subviews.first(where: { $0.tag == 999 }) as? UILabel {
      label.frame = CGRect(x: 0, y: bounds.height - 60, width: bounds.width, height: 50)
    }
  }
  
  func loadImage(from urlString: String) {
    print("🔍 Loading image from: \(urlString)")
    guard let url = URL(string: urlString) else {
      onProcessingError(["error": "Invalid image URL"])
      return
    }
    
    // Load image asynchronously
    DispatchQueue.global(qos: .userInitiated).async { [weak self] in
      guard let data = try? Data(contentsOf: url),
            let image = UIImage(data: data) else {
        DispatchQueue.main.async {
          self?.onProcessingError(["error": "Failed to load image from URL"])
        }
        return
      }
      
      DispatchQueue.main.async {
        self?.originalImage = image
        self?.imageView.image = image
        
        // Process based on availability
        if self?.isVisionKitAvailable == true {
          if #available(iOS 17.0, *) {
            self?.processBackgroundRemovalVisionKit(image: image)
          }
        } else {
          // Fallback: return original image
          self?.onProcessingComplete(["processedImageUri": urlString])
        }
      }
    }
  }
  
  @available(iOS 17.0, *)
  private func processBackgroundRemovalVisionKit(image: UIImage) {
    print("🔍 Starting VisionKit background removal...")
    
    guard let cgImage = image.cgImage else {
      onProcessingError(["error": "Failed to convert image to CGImage"])
      return
    }
    
    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    
    // Create VisionKit request for subject lifting (background removal)
    let request = VNGenerateForegroundInstanceMaskRequest { [weak self] request, error in
      DispatchQueue.main.async {
        if let error = error {
          self?.onProcessingError(["error": "VisionKit processing failed: \(error.localizedDescription)"])
          return
        }
        
        guard let results = request.results as? [VNInstanceMaskObservation],
              let result = results.first else {
          self?.onProcessingError(["error": "No foreground mask found"])
          return
        }
        
        // Apply the mask to create image with transparent background
        if let maskedImage = self?.applyMask(result, to: cgImage, handler: handler) {
          self?.saveAndReturnProcessedImage(maskedImage)
        } else {
          self?.onProcessingError(["error": "Failed to apply background removal mask"])
        }
      }
    }
    
    DispatchQueue.global(qos: .userInitiated).async { [weak self] in
      do {
        try handler.perform([request])
      } catch {
        DispatchQueue.main.async {
          self?.onProcessingError(["error": "VisionKit processing failed: \(error.localizedDescription)"])
        }
      }
    }
  }
  
  @available(iOS 17.0, *)
  private func applyMask(_ mask: VNInstanceMaskObservation, to cgImage: CGImage, handler: VNImageRequestHandler) -> UIImage? {
    do {
      // Generate mask for all instances found in the image
      let maskPixelBuffer = try mask.generateScaledMaskForImage(forInstances: mask.allInstances, from: handler)
      
      // Convert CVPixelBuffer to CGImage
      guard let maskImage = pixelBufferToCGImage(maskPixelBuffer) else {
        print("🔍 Failed to convert mask pixel buffer to CGImage")
        return nil
      }
      
      // Create context for processing with alpha channel
      let width = cgImage.width
      let height = cgImage.height
      
      guard let context = CGContext(data: nil,
                                  width: width,
                                  height: height,
                                  bitsPerComponent: 8,
                                  bytesPerRow: 0,
                                  space: CGColorSpaceCreateDeviceRGB(),
                                  bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue) else {
        return nil
      }
      
      // Clear the context with transparent background
      context.clear(CGRect(x: 0, y: 0, width: width, height: height))
      
      // Set the mask as clipping mask
      context.clip(to: CGRect(x: 0, y: 0, width: width, height: height), mask: maskImage)
      
      // Draw the original image (only the masked areas will be visible)
      context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
      
      guard let resultCGImage = context.makeImage() else {
        return nil
      }
      
      return UIImage(cgImage: resultCGImage)
      
    } catch {
      print("🔍 Error applying mask: \(error.localizedDescription)")
      return nil
    }
  }
  
  @available(iOS 17.0, *)
  private func pixelBufferToCGImage(_ pixelBuffer: CVPixelBuffer) -> CGImage? {
    let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
    let context = CIContext()
    return context.createCGImage(ciImage, from: ciImage.extent)
  }
  
  private func saveAndReturnProcessedImage(_ image: UIImage) {
    // Save to temporary directory
    let tempDir = NSTemporaryDirectory()
    let fileName = "processed_image_\(UUID().uuidString).png"
    let filePath = tempDir + fileName
    let fileURL = URL(fileURLWithPath: filePath)
    
    guard let pngData = image.pngData() else {
      onProcessingError(["error": "Failed to convert processed image to PNG"])
      return
    }
    
    do {
      try pngData.write(to: fileURL)
      print("🔍 Processed image saved to: \(fileURL.absoluteString)")
      onProcessingComplete(["processedImageUri": fileURL.absoluteString])
    } catch {
      onProcessingError(["error": "Failed to save processed image: \(error.localizedDescription)"])
    }
  }
}
