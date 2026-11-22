import type { Me } from "@entities/wallet";

export const hasArenaBan = (me: Pick<Me, "flags"> | undefined) =>
  me?.flags.bans?.some(({ scope }) => scope === "arena") ?? false;
