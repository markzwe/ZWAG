import ExpoModulesCore
import UIKit
import Vision
import CoreImage
import CoreML

class VisionBgRemoverView: ExpoView {
  let onProcessingComplete = EventDispatcher()
  let onProcessingError = EventDispatcher()

  private let processingQueue = DispatchQueue(label: "zwag.background-removal", qos: .userInitiated)
  private var currentRequest = UUID()

  func loadImage(from urlString: String) {
    let requestID = UUID()
    currentRequest = requestID
    // Defer until Expo has registered this view's event handlers.
    DispatchQueue.main.async { [weak self] in
      guard let self = self, self.currentRequest == requestID else { return }
      guard let url = URL(string: urlString), url.isFileURL else {
        self.onProcessingError(["error": "The selected photo could not be opened. Please choose it again."])
        return
      }
      guard #available(iOS 17.0, *) else {
        self.onProcessingError(["error": "Automatic background removal requires iOS 17 or later."])
        return
      }

      self.processingQueue.async { [weak self] in
        autoreleasepool {
          do {
            // The URL handler reads photo orientation metadata, including HEIC images.
            let handler = VNImageRequestHandler(url: url, options: [:])
            let request = VNGenerateForegroundInstanceMaskRequest()
            #if targetEnvironment(simulator)
            // Simulators don't expose an iPhone Neural Engine. Prefer a supported
            // CPU compute device instead of Vision's automatic hardware selection.
            for (stage, devices) in try request.supportedComputeStageDevices {
              if let cpu = devices.first(where: { if case .cpu = $0 { return true }; return false }) {
                request.setComputeDevice(cpu, for: stage)
              }
            }
            #endif
            try handler.perform([request])
            guard let observation = request.results?.first,
                  !observation.allInstances.isEmpty else {
              throw NSError(domain: "ZWAG.BackgroundRemoval", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "No clothing subject was found. Try a clearer photo with the item separated from its background."
              ])
            }

            // Vision generates the transparent cutout and crops it in image coordinates.
            // Its masks aren't necessarily 8-bit images; don't scan their raw bytes.
            let cutout = try observation.generateMaskedImage(
              ofInstances: observation.allInstances,
              from: handler,
              croppedToInstancesExtent: true
            )
            let ciImage = CIImage(cvPixelBuffer: cutout)
            let context = CIContext()
            guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent),
                  let png = UIImage(cgImage: cgImage).pngData() else {
              throw NSError(domain: "ZWAG.BackgroundRemoval", code: 2, userInfo: [
                NSLocalizedDescriptionKey: "The processed photo could not be saved. Please try again."
              ])
            }
            let output = FileManager.default.temporaryDirectory
              .appendingPathComponent("processed_image_\(UUID().uuidString).png")
            try png.write(to: output, options: .atomic)
            DispatchQueue.main.async { [weak self] in
              guard let self = self, self.currentRequest == requestID else { return }
              self.onProcessingComplete(["processedImageUri": output.absoluteString])
            }
          } catch {
            DispatchQueue.main.async { [weak self] in
              guard let self = self, self.currentRequest == requestID else { return }
              self.onProcessingError(["error": error.localizedDescription])
            }
          }
        }
      }
    }
  }
}
