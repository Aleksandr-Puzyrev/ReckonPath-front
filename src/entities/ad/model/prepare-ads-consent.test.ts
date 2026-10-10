import {
  PermissionStatus,
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";
import { Platform } from "react-native";

import { useAdsConsentStore } from "./ads-consent-store";
import { confirmPreScreen, handlePreScreenClosed, prepareAdsConsent } from "./prepare-ads-consent";

jest.mock("expo-tracking-transparency", () => ({
  ...jest.requireActual("expo-tracking-transparency"),
  getTrackingPermissionsAsync: jest.fn(),
  requestTrackingPermissionsAsync: jest.fn(),
}));

const permission = (status: PermissionStatus) => ({
  status,
  granted: status === PermissionStatus.GRANTED,
  canAskAgain: status === PermissionStatus.UNDETERMINED,
  expires: "never" as const,
});

const getPermission = jest.mocked(getTrackingPermissionsAsync);
const requestPermission = jest.mocked(requestTrackingPermissionsAsync);

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("prepareAdsConsent", () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, "OS", "ios");
    getPermission.mockReset();
    requestPermission.mockReset();
    useAdsConsentStore.getState().reset();
  });

  test("shows the pre-screen, then asks the system on iOS (ADS-08)", async () => {
    getPermission.mockResolvedValue(permission(PermissionStatus.UNDETERMINED));
    requestPermission.mockResolvedValue(permission(PermissionStatus.GRANTED));

    const consent = prepareAdsConsent();
    await nextTick();
    expect(useAdsConsentStore.getState().isPreScreenOpen).toBe(true);
    confirmPreScreen();
    expect(useAdsConsentStore.getState().isPreScreenOpen).toBe(false);
    await nextTick();
    expect(requestPermission).not.toHaveBeenCalled();
    handlePreScreenClosed();

    await expect(consent).resolves.toBe(true);
    expect(useAdsConsentStore.getState().isPreScreenOpen).toBe(false);
  });

  test("falls back to non-personalised ads after a refusal (ADS-08)", async () => {
    getPermission.mockResolvedValue(permission(PermissionStatus.UNDETERMINED));
    requestPermission.mockResolvedValue(permission(PermissionStatus.DENIED));

    const consent = prepareAdsConsent();
    await nextTick();
    confirmPreScreen();
    handlePreScreenClosed();

    await expect(consent).resolves.toBe(false);
  });

  test("asks only once", async () => {
    getPermission.mockResolvedValue(permission(PermissionStatus.DENIED));

    await expect(prepareAdsConsent()).resolves.toBe(false);
    expect(useAdsConsentStore.getState().isPreScreenOpen).toBe(false);
    expect(requestPermission).not.toHaveBeenCalled();
  });

  test("needs no consent on Android", async () => {
    jest.replaceProperty(Platform, "OS", "android");

    await expect(prepareAdsConsent()).resolves.toBe(true);
    expect(getPermission).not.toHaveBeenCalled();
  });

  test("shares one question between concurrent callers", async () => {
    getPermission.mockResolvedValue(permission(PermissionStatus.UNDETERMINED));
    requestPermission.mockResolvedValue(permission(PermissionStatus.GRANTED));

    const first = prepareAdsConsent();
    const second = prepareAdsConsent();
    await nextTick();
    confirmPreScreen();
    handlePreScreenClosed();

    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });
});
