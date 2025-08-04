import ExpoModulesCore

public class VisionBgRemoverModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VisionBgRemover")

    Events("onProcessingComplete", "onProcessingError")

    Function("hello") {
      return "Hello from VisionBgRemover! 👋"
    }
    
    Function("isVisionKitAvailable") {
      if #available(iOS 17.0, *) {
        return true
      } else {
        return false
      }
    }

    // Register the main view (will handle version checking internally)
    View(VisionBgRemoverView.self) {
      Prop("imageUri") { (view: VisionBgRemoverView, imageUri: String) in
        print("🔍 VisionBgRemover - imageUri prop received: \(imageUri)")
        view.loadImage(from: imageUri)
      }
      
      Events("onProcessingComplete", "onProcessingError")
    }
  }
}
