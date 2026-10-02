import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

const mmkv = createMMKV({ id: "reckon-path" });

export const keyValueStorage = {
  getItem: (name: string) => mmkv.getString(name) ?? null,
  setItem: (name: string, value: string) => mmkv.set(name, value),
  removeItem: (name: string) => {
    mmkv.remove(name);
  },
};

export const zustandStorage: StateStorage = keyValueStorage;
