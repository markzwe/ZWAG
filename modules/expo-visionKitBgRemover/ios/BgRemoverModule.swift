import ExpoModulesCore

@available(iOS 17.0, *)
public class BgRemoverModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BgRemover")

    Constants([
      "PI": Double.pi
    ])

    Events("onChange")

    Function("hello") {
      return "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { (value: String) in
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    View(BgRemoverView.self) {
      Prop("imageUri") { (view: BgRemoverView, imageUri: String) in
        print("🔍 Module - imageUri prop received: \(imageUri)")
        view.loadImage(from: imageUri)
      }
      
      Prop("onProcessingComplete") { (view: BgRemoverView, callback: @escaping RCTDirectEventBlock) in
        view.processingCompleteCallback = callback
      }
    }
  }
}
