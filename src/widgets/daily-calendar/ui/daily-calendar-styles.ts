import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.space[5],
    gap: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[1],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legend: {
    flexDirection: "row",
    gap: theme.space[4],
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
  },
  legendWon: {
    width: theme.space[3],
    height: theme.space[3],
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.status.success,
  },
  legendLost: {
    width: theme.space[3],
    height: theme.space[3],
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: theme.colors.status.danger,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  week: {
    flexDirection: "row",
    gap: theme.sizes.daily.calendarGap,
  },
  weeks: {
    gap: theme.sizes.daily.calendarGap,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
}));
