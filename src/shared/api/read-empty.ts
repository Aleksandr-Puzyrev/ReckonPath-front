import { readData } from "./read-data";

interface ApiResult {
  error?: unknown;
  response: Response;
}

export const readEmpty = ({ error, response }: ApiResult) => {
  if (response.ok) return;
  readData({ error, response });
};
