export const SEARCH_MIN_LENGTH = 3;

export const searchNicknameOf = (text: string) => {
  const nickname = text.trim();
  return nickname.length < SEARCH_MIN_LENGTH ? null : nickname;
};
