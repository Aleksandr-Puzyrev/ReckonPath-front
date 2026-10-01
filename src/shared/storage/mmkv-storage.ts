import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

const mmkv = createMMKV({ id: "reckon-path" });

export const zustandStorage: StateStorage = {
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => {
    mmkv.remove(name);
  },
};
