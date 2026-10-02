import { useDailyRecordStore } from "@entities/daily";
import { CAMPAIGN_LEVELS } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { hasSavedSession } from "@entities/session";
import { apiClient, ApiError, readData, readErrorEnvelope } from "@shared/api";

import { mergeBest } from "./merge-best";

const BATCH_SIZE = 50;
const HTTP_SERVER_ERROR = 500;
// The request itself is fine, so the attempts must wait: auth, a timeout, an app update, a rate limit (с самим запросом всё в порядке, попытки должны подождать: авторизация, тайм-аут, обновление приложения, лимит запросов).
const KEEP_ON_STATUSES: ReadonlySet<number> = new Set([401, 408, 426, 429]);

const KNOWN_LEVEL_IDS: ReadonlySet<string> = new Set(CAMPAIGN_LEVELS.map(({ level }) => level.id));

const sendBatch = async () => {
  const batch = useOutboxStore.getState().attempts.slice(0, BATCH_SIZE);
  const { data, error, response } = await apiClient.POST("/attempts:batch", {
    body: { attempts: batch },
  });
  if (
    !response.ok &&
    (response.status >= HTTP_SERVER_ERROR || KEEP_ON_STATUSES.has(response.status))
  ) {
    const { code, details } = readErrorEnvelope(error);
    throw new ApiError(response.status, code, details);
  }
  data?.results.forEach(({ attemptId, daily }) => {
    if (daily === undefined) return;
    useDailyRecordStore.getState().recordPlace(attemptId, {
      rank: daily.rank ?? null,
      percentile: daily.percentile ?? null,
      ranked: daily.ranked ?? null,
    });
  });
  // Every answered attempt leaves the queue, whatever its status; a rejected batch is dropped too (каждая отвеченная попытка уходит из очереди при любом статусе; отклонённая пачка тоже удаляется).
  // TODO: report rejected attempts and dropped batches to Sentry once it is set up
  useOutboxStore.getState().remove(batch.map(({ attemptId }) => attemptId));
};

const reconcileProgress = async () => {
  const { levels } = readData(await apiClient.GET("/progress"));
  // The outbox is read after the response, so a win made meanwhile is not lost (очередь читается после ответа, чтобы победа за это время не потерялась).
  const pending = useOutboxStore.getState().attempts;
  useProgressStore.getState().replaceBest(mergeBest(levels, pending, KNOWN_LEVEL_IDS));
};

export const syncAttempts = async () => {
  if (!(await hasSavedSession())) return;
  while (useOutboxStore.getState().attempts.length > 0) await sendBatch();
  await reconcileProgress();
};
