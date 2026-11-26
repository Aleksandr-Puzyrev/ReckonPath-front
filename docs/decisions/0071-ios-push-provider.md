# 0071. iOS push provider

Date: 2026-11-26. Answered by: developer.

The client uses FCM for delivery on iOS as well as Android. Firebase delivers to Apple devices through APNs. The Go backend can reuse its FCM sender. This supersedes the direct APNs sender requirement for iOS in Part 8 §10.2 and Part 9.

For a live check, register the iOS bundle ID in the Firebase project used by the backend, configure APNs in Firebase, and build a signed app with the Push Notifications capability. The client configuration comes from the matching `GoogleService-Info.plist`.
