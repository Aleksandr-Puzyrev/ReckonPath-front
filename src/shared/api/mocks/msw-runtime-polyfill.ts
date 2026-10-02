interface MessageEventInit {
  data?: unknown;
}

// msw relies on two web APIs React Native lacks: its event library extends MessageEvent at load time, and responses read Headers.getSetCookie (msw опирается на два веб-API, которых нет в React Native: библиотека событий наследует MessageEvent при загрузке, а ответы читают Headers.getSetCookie).
if (typeof globalThis.MessageEvent === "undefined") {
  class MessageEventPolyfill extends Event {
    readonly data: unknown;

    constructor(type: string, init: MessageEventInit = {}) {
      super(type);
      this.data = init.data;
    }
  }
  Object.defineProperty(globalThis, "MessageEvent", { value: MessageEventPolyfill });
}

if (typeof Headers.prototype.getSetCookie !== "function") {
  Headers.prototype.getSetCookie = function getSetCookie(this: Headers) {
    const value = this.get("Set-Cookie");
    return value === null ? [] : [value];
  };
}
