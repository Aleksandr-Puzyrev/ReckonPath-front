export const NICKNAME_MIN_LENGTH = 3;
export const NICKNAME_MAX_LENGTH = 16;
// Latin only, the same as the server, so a nickname that passes here is not rejected there (только латиница, как на сервере, чтобы ник, прошедший здесь, не отклонялся там).
export const NICKNAME_CHARS = /^[A-Za-z0-9_]+$/;
