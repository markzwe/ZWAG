// import ExpoModulesCore
// import VisionKit
// import UIKit

// @available(iOS 17.0, *)
// public class ExpoBackgroundRemoverModule: Module {
  
//   public func definition() -> ModuleDefinition {
//     Name("ExpoBackgroundRemover")

//     Constants([
//       "PI": Double.pi
//     ])

//     Events("onChange")

//     Function("hello") {
//       return "Hello world! 👋"
//     }

//     AsyncFunction("setValueAsync") { (value: String) in
//       self.sendEvent("onChange", [
//         "value": value
//       ])
//     }

//     // ✅ Add the removeBackground function that TypeScript expects
//     AsyncFunction("removeBackground") { (imageUri: String) -> [String: Any] in
//       return await self.processImageWithVisionKit(imageUri: imageUri)
//     }

//     // ✅ Register the native view component
//     View(ExpoBackgroundRemoverView.self) {      
//       Prop("imageUri") { (view: ExpoBackgroundRemoverView, imageUri: String) in
//         view.loadImage(from: imageUri)
//       }

//       Events("onLoad", "onProcessingComplete", "onSubjectLifted")
//     }
//   }
  
//   @available(iOS 17.0, *)
//   private func processImageWithVisionKit(imageUri: String) async -> [String: Any] {
//     guard let url = URL(string: imageUri),
//           let data = try? Data(contentsOf: url),
//           let image = UIImage(data: data) else {
//       return [
//         "success": false,
//         "hasSubjects": false
//       ]
//     }
    
//     let analyzer = ImageAnalyzer()
//     let configuration = ImageAnalyzer.Configuration([.visualLookUp])
    
//     do {
//       let analysis = try await analyzer.analyze(image, configuration: configuration)
      
//       if analysis.hasResults(for: .visualLookUp) {
//         // Process with white background
//         let processedImage = await createImageWithWhiteBackground(image)
//         let processedUri = saveImageToTempDirectory(processedImage)
        
//         return [
//           "success": true,
//           "processedImageUri": processedUri ?? "",
//           "hasSubjects": true
//         ]
//       } else {
//         return [
//           "success": false,
//           "hasSubjects": false
//         ]
//       }
//     } catch {
//       return [
//         "success": false,
//         "hasSubjects": false
//       ]
//     }
//   }
  
//   private func createImageWithWhiteBackground(_ image: UIImage) async -> UIImage {
//     let size = image.size
//     let renderer = UIGraphicsImageRenderer(size: size)
    
//     return renderer.image { context in
//       // Fill with white background
//       context.cgContext.setFillColor(UIColor.white.cgColor)
//       context.cgContext.fill(CGRect(origin: .zero, size: size))
      
//       // Draw original image on top
//       image.draw(at: .zero)
//     }
//   }
  
//   private func saveImageToTempDirectory(_ image: UIImage) -> String? {
//     guard let data = image.jpegData(compressionQuality: 0.9) else { return nil }
    
//     let tempDir = NSTemporaryDirectory()
//     let fileName = "processed_image_\(UUID().uuidString).jpg"
//     let fileURL = URL(fileURLWithPath: tempDir).appendingPathComponent(fileName)
    
//     do {
//       try data.write(to: fileURL)
//       return fileURL.absoluteString
//     } catch {
//       return nil
//     }
//   }
// }
