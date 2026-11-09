import type { Transport } from "./api-fetch";
import { readErrorEnvelope } from "./read-error-envelope";

const HTTP_CONFLICT = 409;
const MS_PER_SECOND = 1000;
const DEFAULT_RETRY_AFTER_S = 1;

const isInProgress = async (response: Response) => {
  if (response.status !== HTTP_CONFLICT) return false;
  const body: unknown = await response
    .clone()
    .json()
    .catch(() => null);
  return readErrorEnvelope(body).code === "idempotency_in_progress";
};

const retryAfterMs = (response: Response) => {
  const header = response.headers.get("Retry-After");
  const seconds = header === null ? NaN : Number(header);
  return (
    (Number.isFinite(seconds) && seconds >= 0 ? seconds : DEFAULT_RETRY_AFTER_S) * MS_PER_SECOND
  );
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The server is still running the first request with this key; the same key gets its stored answer once it ends (сервер ещё выполняет первый запрос с этим ключом; тот же ключ получит сохранённый ответ, когда он закончится).
export const retryInProgress =
  (transport: Transport): Transport =>
  async (request) => {
    const replay = request.clone();
    const response = await transport(request);
    if (!(await isInProgress(response))) return response;
    await wait(retryAfterMs(response));
    return transport(replay);
  };
