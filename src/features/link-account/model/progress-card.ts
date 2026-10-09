import type { LoginResult } from "../api/login-mutation";

export interface ProgressCard {
  name: string;
  level: number;
  stars: number;
  league: string | null;
}

export const savedCardOf = ({ user, summary }: LoginResult): ProgressCard => ({
  name: user.nickname,
  ...summary,
});
