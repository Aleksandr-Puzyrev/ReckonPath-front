import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { uuidv7 } from "uuidv7";

const REFRESH_TOKEN_KEY = "reckon-path.refresh-token";
const DEVICE_ID_KEY = "reckon-path.device-id";

export const readRefreshToken = () => getItemAsync(REFRESH_TOKEN_KEY);

export const saveRefreshToken = (refreshToken: string) =>
  setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

export const deleteRefreshToken = () => deleteItemAsync(REFRESH_TOKEN_KEY);

export const readDeviceId = async () => {
  const saved = await getItemAsync(DEVICE_ID_KEY);
  if (saved !== null) return saved;
  const created = uuidv7();
  await setItemAsync(DEVICE_ID_KEY, created);
  return created;
};
