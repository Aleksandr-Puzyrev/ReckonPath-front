# 0069. Offline campaign on the backend

Date: 2026-11-26. Answered by: developer. Extends 0068 and supersedes the offline deferral in 0060 #3 and the offline continue in 0018 #1.

1. The signed-in client downloads an encrypted pack automatically. The Levels screen shows its validity and opens the next downloaded level when offline or during maintenance. Pack keys are stored in SecureStore, separately from the ciphertext.
2. An offline win opens the next downloaded level provisionally. The client saves accepted taps to resume an interrupted game. Offline games have no paid or ad continue.
3. The client sends finished attempts in completion order when connectivity returns. It keeps unanswered attempts and displays explicit server rejections. The server confirms rewards and progress. The client adopts the server's expiry and synchronization grace window. A valid active attempt can finish within that window.
