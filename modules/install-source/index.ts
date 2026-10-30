import { requireOptionalNativeModule } from "expo";

interface InstallSourceModule {
  getInstallerPackageName: () => string | null;
}

// Android only: the package of the store that installed the app; null until a dev build with the module is installed (только Android: пакет магазина, установившего приложение; null, пока не установлена dev-сборка с модулем).
export const installerPackageName = () =>
  requireOptionalNativeModule<InstallSourceModule>("InstallSource")?.getInstallerPackageName() ??
  null;
