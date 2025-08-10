import ExpoModulesCore
import UIKit
import Vision
import CoreImage
#if canImport(VisionKit)
import VisionKit
#endif

@available(iOS 13.0, *)
class VisionBgRemoverView: ExpoView {
  // Events to JS
  let onProcessingComplete = EventDispatcher()
  let onProcessingError = EventDispatcher()

  private var imageView: UIImageView!
  private var originalImage: UIImage?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupView()
  }

  private var isVisionKitAvailable: Bool {
    if #available(iOS 17.0, *) {
      return true
    } else {
      return false
    }
  }

  private func setupView() {
    backgroundColor = UIColor(white: 0.95, alpha: 1.0)
    layer.cornerRadius = 12
    clipsToBounds = true

    imageView = UIImageView()
    imageView.contentMode = .scaleAspectFit
    addSubview(imageView)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    imageView.frame = bounds
  }

  // Public function to load image from URL string (called from JS)
  func loadImage(from urlString: String) {
    guard let url = URL(string: urlString) else {
      onProcessingError(["error": "Invalid image URL"])
      return
    }

    DispatchQueue.global(qos: .userInitiated).async { [weak self] in
      guard let data = try? Data(contentsOf: url), let uiImage = UIImage(data: data) else {
        DispatchQueue.main.async {
          self?.onProcessingError(["error": "Failed to load image"])
        }
        return
      }

      DispatchQueue.main.async {
        guard let self = self else { return }
        self.originalImage = uiImage
        self.imageView.image = uiImage

        if self.isVisionKitAvailable, #available(iOS 17.0, *) {
          self.processBackgroundRemovalVisionKit(image: uiImage)
        } else {
          // fallback: return original image URI for older devices
          self.onProcessingComplete(["processedImageUri": url.absoluteString])
        }
      }
    }
  }

  // MARK: - VisionKit processing (iOS 17+)
  @available(iOS 17.0, *)
  private func processBackgroundRemovalVisionKit(image: UIImage) {
    guard let cgImage = image.cgImage else {
      onProcessingError(["error": "Unable to get CGImage"])
      return
    }

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

    let request = VNGenerateForegroundInstanceMaskRequest { [weak self] request, error in
      DispatchQueue.main.async {
        guard let self = self else { return }

        if let error = error {
          self.onProcessingError(["error": "VisionKit failed: \(error.localizedDescription)"])
          return
        }

        guard let results = request.results as? [VNInstanceMaskObservation], 
              let maskObservation = results.first else {
          self.onProcessingError(["error": "No foreground mask found"])
          return
        }

        // Apply the mask and crop tightly
        guard let processedImage = self.applyMaskAndCrop(maskObservation, to: cgImage, using: handler) else {
          self.onProcessingError(["error": "Failed to apply mask/crop"])
          return
        }

        // Update the display
        self.imageView.image = processedImage
        
        // Save and return processed image
        self.saveAndReturnProcessedImage(processedImage)
      }
    }

    // Perform request on background queue
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        try handler.perform([request])
      } catch {
        DispatchQueue.main.async {
          self.onProcessingError(["error": "VisionKit perform error: \(error.localizedDescription)"])
        }
      }
    }
  }

  @available(iOS 17.0, *)
  private func applyMaskAndCrop(_ maskObservation: VNInstanceMaskObservation, to cgImage: CGImage, using handler: VNImageRequestHandler) -> UIImage? {
    do {
      let maskPixelBuffer = try maskObservation.generateScaledMaskForImage(forInstances: maskObservation.allInstances, from: handler)

      guard let maskCGImage = pixelBufferToCGImage(maskPixelBuffer) else {
        return nil
      }

      // Find bounding box from mask
      guard let boundingBox = computeBoundingBox(from: maskCGImage) else {
        return nil
      }

      // Crop original image and mask to bounding box
      guard let croppedOriginal = cgImage.cropping(to: boundingBox),
            let croppedMask = maskCGImage.cropping(to: boundingBox) else {
        return nil
      }

      // Apply mask to cropped image
      guard let maskedImage = applyMask(croppedMask, to: croppedOriginal) else {
        return nil
      }

      return UIImage(cgImage: maskedImage, scale: UIScreen.main.scale, orientation: .up)

    } catch {
      return nil
    }
  }

  private func pixelBufferToCGImage(_ pixelBuffer: CVPixelBuffer) -> CGImage? {
    let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
    let context = CIContext(options: nil)
    return context.createCGImage(ciImage, from: ciImage.extent)
  }

  private func computeBoundingBox(from mask: CGImage) -> CGRect? {
    guard let provider = mask.dataProvider, let data = provider.data else {
      return nil
    }

    let ptr = CFDataGetBytePtr(data)
    let width = mask.width
    let height = mask.height
    let bytesPerRow = mask.bytesPerRow
    let bytesPerPixel = bytesPerRow / width

    var minX = width
    var maxX = 0
    var minY = height
    var maxY = 0
    var foundAny = false

    for y in 0..<height {
      for x in 0..<width {
        let pixelIndex = y * bytesPerRow + x * bytesPerPixel
        let value = ptr![pixelIndex]
        if value > 128 {
          foundAny = true
          if x < minX { minX = x }
          if x > maxX { maxX = x }
          if y < minY { minY = y }
          if y > maxY { maxY = y }
        }
      }
    }

    if !foundAny { return nil }

    return CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
  }

  private func applyMask(_ mask: CGImage, to image: CGImage) -> CGImage? {
    let width = image.width
    let height = image.height

    guard let context = CGContext(data: nil,
                                  width: width,
                                  height: height,
                                  bitsPerComponent: 8,
                                  bytesPerRow: 0,
                                  space: CGColorSpaceCreateDeviceRGB(),
                                  bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue) else {
      return nil
    }

    context.clear(CGRect(x: 0, y: 0, width: width, height: height))
    context.clip(to: CGRect(x: 0, y: 0, width: width, height: height), mask: mask)
    context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))

    return context.makeImage()
  }

  private func saveAndReturnProcessedImage(_ image: UIImage) {
    let tempDir = NSTemporaryDirectory()
    let fileName = "processed_image_\(UUID().uuidString).png"
    let filePath = (tempDir as NSString).appendingPathComponent(fileName)
    let fileURL = URL(fileURLWithPath: filePath)

    guard let pngData = image.pngData() else {
      onProcessingError(["error": "Failed to convert processed image to PNG"])
      return
    }

    do {
      try pngData.write(to: fileURL)
      onProcessingComplete(["processedImageUri": fileURL.absoluteString])
    } catch {
      onProcessingError(["error": "Failed to save processed image: \(error.localizedDescription)"])
    }
  }
}