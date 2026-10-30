import { apiSession } from "@entities/session";
import { setApiSession } from "@shared/api";

// Set on import, before any screen sends a request; an effect would run after the screens' own effects (задаётся при импорте, до запросов экранов; эффект сработал бы после эффектов самих экранов).
setApiSession(apiSession);
