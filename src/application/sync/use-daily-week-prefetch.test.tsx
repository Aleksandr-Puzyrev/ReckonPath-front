import { renderHook, waitFor } from "@testing-library/react-native";
import { http } from "msw/http";

import { setApiSession } from "@shared/api";
import { ACCOUNT_SESSION } from "@shared/test-utils/account-session";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useDailyWeekPrefetch } from "./use-daily-week-prefetch";

const DAYS_AHEAD = 7;

const countDays = () => {
  const counter = { count: 0 };
  mockServer.use(
    http.get(mockUrl("/daily/:date"), () => {
      counter.count += 1;
      return undefined;
    }),
  );
  return counter;
};

describe("useDailyWeekPrefetch", () => {
  afterEach(() => {
    mockServer.reset();
    setApiSession(null);
  });

  test("caches the coming days for an account (DLY-13)", async () => {
    setApiSession(ACCOUNT_SESSION);
    const days = countDays();

    await renderHook(useDailyWeekPrefetch, { wrapper: createQueryWrapper() });

    await waitFor(() => expect(days.count).toBe(DAYS_AHEAD));
  });

  test("asks nothing for a guest (decision 0051 #4)", async () => {
    setApiSession({ ...ACCOUNT_SESSION, hasAccount: () => false });
    const days = countDays();

    await renderHook(useDailyWeekPrefetch, { wrapper: createQueryWrapper() });

    expect(days.count).toBe(0);
  });
});
