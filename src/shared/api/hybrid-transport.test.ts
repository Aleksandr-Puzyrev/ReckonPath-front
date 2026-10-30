import { createHybridTransport, matchesRoute } from "./hybrid-transport";

const BASE = "http://127.0.0.1:8080/api/v1";

const request = (method: string, path: string) => new Request(`${BASE}${path}`, { method });

describe("matchesRoute", () => {
  test("matches the path template with its parameters", () => {
    const route = { method: "GET", path: "/arena/maps/{id}" } as const;

    expect(matchesRoute(request("GET", "/arena/maps/m_7"), route)).toBe(true);
    expect(matchesRoute(request("GET", "/arena/maps/m_7/activate"), route)).toBe(false);
  });

  test("requires the same method", () => {
    expect(matchesRoute(request("DELETE", "/me"), { method: "GET", path: "/me" })).toBe(false);
  });

  test("ignores requests outside the API", () => {
    const asset = new Request("http://127.0.0.1:8080/cdn/me", { method: "GET" });

    expect(matchesRoute(asset, { method: "GET", path: "/me" })).toBe(false);
  });
});

describe("createHybridTransport", () => {
  const reply = (source: string) => jest.fn(async () => new Response(source));

  test("sends a listed route to the backend and everything else to the mocks", async () => {
    const backend = reply("backend");
    const mocks = reply("mocks");
    const transport = createHybridTransport([{ method: "GET", path: "/me" }], backend, mocks);

    expect(await (await transport(request("GET", "/me"))).text()).toBe("backend");
    expect(await (await transport(request("GET", "/shop"))).text()).toBe("mocks");
  });

  test("keeps everything on the mocks while no route is listed", async () => {
    const backend = reply("backend");
    const transport = createHybridTransport([], backend, reply("mocks"));

    await transport(request("GET", "/me"));

    expect(backend).not.toHaveBeenCalled();
  });
});
