// Lessons that no level element shows: the flags card on level 7, the tutorial on level 1, the move-limit hint on level 2 (уроки, которые не видны по элементам уровня).
export const LEVEL_LESSONS: Readonly<Record<string, readonly string[]>> = {
  "c-7": ["flags"],
};

export const TUTORIAL = {
  levelId: "c-1",
  firstCell: [2, 1] as const,
  movesHintLevelId: "c-2",
};
