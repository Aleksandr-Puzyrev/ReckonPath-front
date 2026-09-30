import { fireEvent, render, screen } from "@testing-library/react-native";
import type { BottomTabBarProps } from "expo-router/tabs";

import { i18n } from "@shared/i18n";

import { TAB_ITEMS } from "../model/tab-items";

import TabBar from "./tab-bar";

const createProps = (activeIndex: number, isDefaultPrevented = false) => {
  const routes = TAB_ITEMS.map(({ routeName }) => ({ key: `${routeName}-key`, name: routeName }));
  const navigation = {
    emit: jest.fn(() => ({ defaultPrevented: isDefaultPrevented })),
    navigate: jest.fn(),
  };
  // The tab bar reads only these fields (таб-бар читает только эти поля).
  const props = {
    state: { index: activeIndex, routes },
    navigation,
  } as unknown as BottomTabBarProps;

  return { props, navigation };
};

describe("TabBar", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("ru");
  });

  test("shows the five tabs in spec order with localized labels", async () => {
    const { props } = createProps(0);
    await render(<TabBar {...props} />);

    const labels = screen.getAllByRole("tab").map((tab) => tab.props.accessibilityLabel);
    expect(labels).toEqual(["Игра", "Уровни", "Арена", "Витрина", "Профиль"]);
  });

  test("keeps the spec order when the router lists routes in another order", async () => {
    const { props } = createProps(0);
    // Expo Router orders routes on its own (Expo Router сортирует маршруты по-своему).
    const shuffled = ["index", "shop", "arena", "levels", "profile"].map((name) => ({
      key: `${name}-key`,
      name,
    }));
    const shuffledProps = { ...props, state: { ...props.state, index: 1, routes: shuffled } };
    await render(<TabBar {...(shuffledProps as unknown as BottomTabBarProps)} />);

    const labels = screen.getAllByRole("tab").map((tab) => tab.props.accessibilityLabel);
    expect(labels).toEqual(["Игра", "Уровни", "Арена", "Витрина", "Профиль"]);
    expect(screen.getByRole("tab", { name: "Витрина" })).toBeSelected();
  });

  test("marks only the active tab as selected", async () => {
    const { props } = createProps(2);
    await render(<TabBar {...props} />);

    expect(screen.getByRole("tab", { name: "Арена" })).toBeSelected();
    expect(screen.getByRole("tab", { name: "Игра" })).not.toBeSelected();
  });

  test("navigates to a tab when an inactive tab is pressed", async () => {
    const { props, navigation } = createProps(0);
    await render(<TabBar {...props} />);

    fireEvent.press(screen.getByRole("tab", { name: "Витрина" }));

    expect(navigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: "tabPress", target: "shop-key" }),
    );
    expect(navigation.navigate).toHaveBeenCalledWith("shop", undefined);
  });

  test("does not navigate when the active tab is pressed again", async () => {
    const { props, navigation } = createProps(1);
    await render(<TabBar {...props} />);

    fireEvent.press(screen.getByRole("tab", { name: "Уровни" }));

    expect(navigation.emit).toHaveBeenCalledWith(expect.objectContaining({ type: "tabPress" }));
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  test("does not navigate when the press is prevented by a listener", async () => {
    const { props, navigation } = createProps(0, true);
    await render(<TabBar {...props} />);

    fireEvent.press(screen.getByRole("tab", { name: "Профиль" }));

    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  test("uses English labels when the language is English", async () => {
    await i18n.changeLanguage("en");
    const { props } = createProps(0);
    await render(<TabBar {...props} />);

    expect(screen.getByRole("tab", { name: "Shop" })).toBeTruthy();
  });
});
