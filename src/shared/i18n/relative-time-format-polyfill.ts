// Hermes has no Intl.RelativeTimeFormat; the forced polyfill gives «вчера» / "yesterday" on every platform (в Hermes нет Intl.RelativeTimeFormat; принудительный полифилл даёт «вчера» / "yesterday" на всех платформах).
import "@formatjs/intl-relativetimeformat/polyfill-force.js";
import "@formatjs/intl-relativetimeformat/locale-data/en.js";
import "@formatjs/intl-relativetimeformat/locale-data/ru.js";
