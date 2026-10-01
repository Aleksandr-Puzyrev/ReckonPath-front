// Hermes has no full Intl.PluralRules, so i18next would always pick the "other" form; the forced polyfill gives the same forms on every platform (в Hermes нет полного Intl.PluralRules, и i18next всегда брал бы форму "other"; принудительный полифилл даёт одинаковые формы на всех платформах).
import "@formatjs/intl-pluralrules/polyfill-force.js";
import "@formatjs/intl-pluralrules/locale-data/en.js";
import "@formatjs/intl-pluralrules/locale-data/ru.js";
