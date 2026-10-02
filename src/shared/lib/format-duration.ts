const SECOND_MS = 1000;
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const PAD = 2;

const pad = (value: number) => String(value).padStart(PAD, "0");

export const formatDuration = (ms: number) => {
  const seconds = Math.max(0, Math.round(ms / SECOND_MS));
  return `${Math.floor(seconds / SECONDS_IN_MINUTE)}:${pad(seconds % SECONDS_IN_MINUTE)}`;
};

export const formatCountdown = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / SECOND_MS));
  const hours = Math.floor(seconds / SECONDS_IN_HOUR);
  const minutes = Math.floor((seconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds % SECONDS_IN_MINUTE)}`;
};
