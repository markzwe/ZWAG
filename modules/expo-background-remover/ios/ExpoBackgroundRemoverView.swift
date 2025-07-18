import ExpoModulesCore
import VisionKit
import UIKit

@available(iOS 17.0, *)
class ExpoBackgroundRemoverView: ExpoView {
  let imageView = UIImageView()
  let statusLabel = UILabel()
  let configuration = ImageAnalyzer.Configuration([.visualLookUp]) // subject lifting only needs visualLookUp
  var interaction: ImageAnalysisInteraction!
  var originalImage: UIImage?
  let onLoad = EventDispatcher()
  private let analyzer = ImageAnalyzer()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupViews()
    setupConstraints()
  }

  private func setupViews() {
    addSubview(imageView)
    addSubview(statusLabel)
    imageView.translatesAutoresizingMaskIntoConstraints = false
    statusLabel.translatesAutoresizingMaskIntoConstraints = false
    imageView.contentMode = .scaleAspectFit
    imageView.isUserInteractionEnabled = true
    statusLabel.textAlignment = .center
    statusLabel.numberOfLines = 0
    statusLabel.font = UIFont.systemFont(ofSize: 14)
  }

  private func setupConstraints() {
    NSLayoutConstraint.activate([
      imageView.leadingAnchor.constraint(equalTo: leadingAnchor),
      imageView.trailingAnchor.constraint(equalTo: trailingAnchor),
      imageView.topAnchor.constraint(equalTo: topAnchor),
      imageView.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -50),
      statusLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
      statusLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16),
      statusLabel.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -10)
    ])
  }

  func loadImage(from imageUri: String) {
    guard let url = URL(string: imageUri) else {
      updateStatus("❌ Invalid image URL")
      return
    }

    updateStatus("📥 Loading image...")

    URLSession.shared.dataTask(with: url) { [weak self] data, _, error in
      guard let self = self, let data = data, let image = UIImage(data: data) else {
        DispatchQueue.main.async { self?.updateStatus("❌ Failed to load image") }
        return
      }

      DispatchQueue.main.async {
        self.originalImage = image
        self.imageView.image = image
        self.updateStatus("✅ Image loaded")

        self.onLoad([
          "success": true,
          "imageSize": ["width": image.size.width, "height": image.size.height]
        ])

        // Start subject lifting
        Task {
          if let subject = await self.liftSubject(from: image) {
            DispatchQueue.main.async {
              self.imageView.image = subject
              self.updateStatus("✅ Subject lifted!")
            }
          } else {
            DispatchQueue.main.async {
              self.updateStatus("❌ No subject detected")
            }
          }
        }
      }
    }.resume()
  }

    func liftSubject(from image: UIImage) async -> UIImage? {
      do {
        let analysis = try await analyzer.analyze(image, configuration: configuration)

        // Create interaction object and assign analysis
        let interaction = ImageAnalysisInteraction()
        interaction.analysis = analysis
        interaction.preferredInteractionTypes = [.automatic]

        // Now get the subject from interaction
        let subjects = await interaction.subjects

          guard let firstSubject = subjects.first else {
          print("❌ No subject found")
          return nil
        }

        // Get cropped image of subject
        let subjectImage = try await firstSubject.image
        return subjectImage

      } catch {
        print("❌ Subject lifting failed: \(error)")
        return nil
      }
    }


  private func updateStatus(_ message: String) {
    statusLabel.text = message
    print("📱 Status: \(message)")
  }
}
