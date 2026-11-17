import { keyValueStorage } from "@shared/storage";

// The local daily and its attempt queue are gone (decision 0061); their saved data is only dead weight on the device (локальный дейли и его очередь попыток удалены — решение 0061; их сохранённые данные — лишний груз на устройстве).
const RETIRED_STORES = ["outbox", "game-session", "daily-records"] as const;

export const removeRetiredStores = () => RETIRED_STORES.forEach(keyValueStorage.removeItem);
