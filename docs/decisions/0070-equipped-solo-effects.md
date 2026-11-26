# 0070. Equipped Lottie effects in solo play

Date: 2026-11-26. Asked by: clarify-task. Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Where equipped Lottie effects play | Enable tap, target reveal and victory in online campaign, offline campaign and Daily. Keep effects out of PvP. | Part 3 §8, Part 8 §4 |
| 2 | Which assets to use | Resolve equipped items from `GET /me/items` and load their Lottie assets and layer colors for the current theme. Keep standard board feedback if the asset is unavailable. | 0055 #3, Part 8 §4.1, §4.3 |

## Consequences

This supersedes the Lottie postponement in 0013 and 0020 for these three modes. The visibility label from 0055 #4 still applies to PvP. The existing shop preview and equipment endpoints supply the required data.
