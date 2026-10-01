import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  board: {
    borderRadius: theme.radius.board,
    boxShadow: theme.elevation[2],
  },
  canvas: {
    flex: 1,
  },
}));
