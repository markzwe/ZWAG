import ExpoModulesCore
import UIKit
import VisionKit

@available(iOS 17.0, *)
class BgRemoverView: ExpoView {

  let view = UIView()
  private let imageView = UIImageView()
  let subjectImageView = UIImageView()
  let interaction = ImageAnalysisInteraction()

  let analyzer = ImageAnalyzer()
  let configuration = ImageAnalyzer.Configuration([.text, .visualLookUp, .machineReadableCode])
  
  // Callback for when processing is complete
  var processingCompleteCallback: RCTDirectEventBlock?
    
    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        addSubview(view)
        
        imageView.translatesAutoresizingMaskIntoConstraints = false
        subjectImageView.translatesAutoresizingMaskIntoConstraints = false
        
        view.addSubview(imageView)
        view.addSubview(subjectImageView)
        
        NSLayoutConstraint.activate([
            imageView.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            imageView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            imageView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            imageView.heightAnchor.constraint(equalTo: view.heightAnchor, multiplier: 0.5),

            subjectImageView.topAnchor.constraint(equalTo: imageView.bottomAnchor, constant: 20),
            subjectImageView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            subjectImageView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            subjectImageView.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -20)
            
        ])

        imageView.contentMode = .scaleAspectFit
        subjectImageView.contentMode = .scaleAspectFit

        DispatchQueue.main.async {
          let image = UIImage(named: "exampleImage") // Replace with your image
          self.imageView.image = image  
          self.imageView.addInteraction(self.interaction)

          Task {
            if let image = image {
                let subjectImage = await self.liftSubject(from: image)
                self.subjectImageView.image = subjectImage
            }
          }
        }

    }
    
    override func layoutSubviews() {
        view.frame = bounds
    }
    func liftSubject(from image: UIImage) async -> UIImage? {
        // First, we need to set up the interaction with the image
        let analysis = try? await analyzer.analyze(image, configuration: configuration)
        guard let analysis = analysis else {
            print("No analysis result")
            return nil
        }
        
        // Set the analysis on the interaction
        interaction.analysis = analysis
        
        // Check if there are any subjects available
        let subjects = await interaction.subjects
        if !subjects.isEmpty {
            print("Found \(subjects.count) subject(s)")
            
            // Try to get the image from the first subject
            do {
                let firstSubject = subjects.first!
                let subjectImage = try await firstSubject.image
                return subjectImage
            } catch {
                print("Error extracting subject image: \(error)")
                return image // Return original image if subject extraction fails
            }
        } else {
            print("No subjects found in the image")
            return image // Return original image if no subjects
        }
    }
    
    func loadImage(from imageUri: String) {
        print("🔍 BgRemoverView - loadImage called with: \(imageUri)")
        
        guard let url = URL(string: imageUri) else { 
            print("❌ Invalid URL: \(imageUri)")
            return 
        }
        
        print("✅ Starting image download from: \(url)")
        
        URLSession.shared.dataTask(with: url) { [weak self] data, _, error in
            if let error = error {
                print("❌ Download error: \(error)")
                return
            }
            
            guard let data = data else {
                print("❌ No data received")
                return
            }
            
            guard let image = UIImage(data: data) else {
                print("❌ Failed to create UIImage from data")
                return
            }
            
            print("✅ Image loaded successfully: \(image.size)")
            
            DispatchQueue.main.async {
                print("✅ Setting image on main thread")
                self?.imageView.image = image
                self?.imageView.addInteraction(self?.interaction ?? ImageAnalysisInteraction())
                
                Task {
                    let subjectImage = await self?.liftSubject(from: image)
                    self?.subjectImageView.image = subjectImage
                    
                    // Save the processed image and call the callback
                    if let processedImage = subjectImage {
                        let processedImageUri = self?.saveImageToDocuments(processedImage, filename: "processed_image.png")
                        
                        print("🎯 Calling processingComplete callback with URI: \(processedImageUri ?? "nil")")
                        self?.processingCompleteCallback?([
                            "processedImageUri": processedImageUri ?? imageUri
                        ])
                    } else {
                        print("⚠️ No processed image, using original")
                        self?.processingCompleteCallback?([
                            "processedImageUri": imageUri
                        ])
                    }
                }
            }
            }
        }.resume()
    }
    
    private func saveImageToDocuments(_ image: UIImage, filename: String) -> String? {
        guard let data = image.pngData() else { return nil }
        
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let filePath = documentsPath.appendingPathComponent(filename)
        
        do {
            try data.write(to: filePath)
            print("✅ Image saved to: \(filePath.path)")
            return filePath.absoluteString
        } catch {
            print("❌ Failed to save image: \(error)")
            return nil
        }
    }
}
