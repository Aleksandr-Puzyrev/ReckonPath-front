export interface ApiSession {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
}

let session: ApiSession | null = null;
let refreshing: Promise<string | null> | null = null;

export const setApiSession = (next: ApiSession | null) => {
  session = next;
};

export const accessToken = () => session?.getAccessToken() ?? null;

const runRefresh = async (current: ApiSession) => {
  try {
    return await current.refreshAccessToken();
  } finally {
    refreshing = null;
  }
};

// Concurrent 401s share one refresh and wait for its token (параллельные 401 ждут один общий refresh).
export const refreshAccessToken = async () => {
  if (session === null) return null;
  refreshing ??= runRefresh(session);
  return refreshing;
};
