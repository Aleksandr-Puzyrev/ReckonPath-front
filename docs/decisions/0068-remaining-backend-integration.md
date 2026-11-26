# 0068. Remaining backend integration

Date: 2026-11-26. Answered by: developer.

1. Connect the shop assets with the server's light and dark palettes. Add campaign statistics to the profile and check nickname availability while typing. Saving still uses `PATCH /me`.
2. Add notification history and read markers, support history and replies, daily results by date, and public event previews with authentication for participation.
3. Connect VK ID and Yandex ID sign-in and linking, and native push settings and registration. Test push is limited to Debug. Restore offline campaign as a separate integration after reconciling its sync contract, superseding the deferral in 0060 #3.
4. Continue using `POST /campaign/games/{id}/continue` for online games. The alternate `POST /continue` has no separate client scenario.
