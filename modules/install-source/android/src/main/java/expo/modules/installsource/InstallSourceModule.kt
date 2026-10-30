package expo.modules.installsource

import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class InstallSourceModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("InstallSource")

    Function("getInstallerPackageName") {
      val context = appContext.reactContext ?: return@Function null
      val manager = context.packageManager
      runCatching {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          manager.getInstallSourceInfo(context.packageName).installingPackageName
        } else {
          // The only installer API before Android 11 (единственный API установщика до Android 11).
          @Suppress("DEPRECATION")
          manager.getInstallerPackageName(context.packageName)
        }
      }.getOrNull()
    }
  }
}
