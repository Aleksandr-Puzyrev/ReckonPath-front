import { StyleSheet as NativeStyleSheet } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create({
  overlay: NativeStyleSheet.absoluteFill,
  cell: {
    position: "absolute",
  },
});
