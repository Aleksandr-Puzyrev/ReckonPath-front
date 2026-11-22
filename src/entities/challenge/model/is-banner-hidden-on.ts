const HIDDEN_ARENA_SCREENS: readonly string[] = ["match", "search", "onboarding"];

// A game, a match and the screens leading into a match keep the player's attention; the arena result does not (игра, матч и экраны перед матчем держат внимание игрока; результат арены — нет).
export const isBannerHiddenOn = ([section, screen]: readonly string[]) => {
  if (section === "play") return true;
  if (section === "editor") return screen === "tryout";
  return section === "arena" && screen !== undefined && HIDDEN_ARENA_SCREENS.includes(screen);
};
