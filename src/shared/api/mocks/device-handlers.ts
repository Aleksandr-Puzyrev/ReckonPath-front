import { http, HttpResponse } from "msw/http";

import { mockUrl } from "./mock-url";

const HTTP_NO_CONTENT = 204;
const HTTP_NOT_FOUND = 404;

const DEVICES = [
  {
    id: "device-1",
    deviceId: "0192a000-0000-7000-8000-00000000d001",
    platform: "ios",
    name: "iPhone 15",
    appVersion: "1.0.0",
    isCurrent: true,
    lastSeenAt: "2026-10-31T09:00:00.000Z",
  },
  {
    id: "device-2",
    deviceId: "0192a000-0000-7000-8000-00000000d002",
    platform: "android",
    name: "Pixel 8",
    appVersion: "1.0.0",
    isCurrent: false,
    lastSeenAt: "2026-10-29T14:05:00.000Z",
  },
];

let devices = DEVICES;

export const resetMockDevices = () => {
  devices = DEVICES;
};

export const deviceHandlers = [
  http.get(mockUrl("/me/devices"), () => HttpResponse.json({ devices })),
  http.delete(mockUrl("/me/devices/:id"), ({ params }) => {
    if (!devices.some(({ id }) => id === params.id)) {
      return HttpResponse.json({ error: { code: "device_not_found" } }, { status: HTTP_NOT_FOUND });
    }
    devices = devices.filter(({ id }) => id !== params.id);
    return new HttpResponse(null, { status: HTTP_NO_CONTENT });
  }),
  http.post(mockUrl("/auth/logout-all"), () => new HttpResponse(null, { status: HTTP_NO_CONTENT })),
];
