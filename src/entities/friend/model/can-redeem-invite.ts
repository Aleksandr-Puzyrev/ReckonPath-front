import type { Invite } from "./friend-types";

// The client does not know the redeem window, so the field stays until a code is entered and the server answers invite_expired after it (клиент не знает срок ввода кода, поэтому поле видно, пока код не введён, а после срока сервер отвечает invite_expired).
export const canRedeemInvite = (invite: Invite | undefined) =>
  invite !== undefined && invite.invitedBy === undefined;
