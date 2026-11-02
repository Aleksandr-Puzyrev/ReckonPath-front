import type { components } from "../generated/schema";

import type { MockPrice } from "./mock-wallet";

type Kind = Exclude<components["schemas"]["ShopKind"], "bundle">;
type Rarity = components["schemas"]["ShopRarity"];
type TabKey = components["schemas"]["ShopTabKey"];

interface LocalText {
  ru: string;
  en: string;
}

export interface MockItem {
  id: string;
  tab: TabKey;
  kind: Kind;
  rarity: Rarity;
  name: LocalText;
  description: LocalText;
  price: MockPrice;
  dropDays: number | null;
  isDefault: boolean;
}

export interface MockBundle {
  id: string;
  name: LocalText;
  description: LocalText;
  rarity: Rarity;
  items: string[];
  basePrice: MockPrice;
  price: MockPrice;
  dropDays: number | null;
}

const DROP_DAYS = 6;

const item = (fields: Omit<MockItem, "dropDays" | "isDefault"> & Partial<MockItem>): MockItem => ({
  dropDays: null,
  isDefault: false,
  ...fields,
});

// The catalog of design 22.x (каталог из дизайна 22.x).
export const MOCK_ITEMS: readonly MockItem[] = [
  item({
    id: "base_board",
    tab: "boards",
    kind: "board",
    rarity: "common",
    name: { ru: "Стандартное поле", en: "Standard board" },
    description: { ru: "", en: "" },
    price: { coins: 0 },
    isDefault: true,
  }),
  item({
    id: "night",
    tab: "exclusive",
    kind: "board",
    rarity: "legendary",
    name: { ru: "Ночной сигнал", en: "Night signal" },
    description: {
      ru: "Неон, вода и светящийся забор. Только до конца дропа.",
      en: "Neon, water and a glowing fence. Drop only.",
    },
    price: { emeralds: 1680 },
    dropDays: DROP_DAYS,
  }),
  item({
    id: "sparks",
    tab: "exclusive",
    kind: "reveal",
    rarity: "epic",
    name: { ru: "Искры", en: "Sparks" },
    description: {
      ru: "Розовая вспышка при открытии цели.",
      en: "A pink flash when you find a target.",
    },
    price: { emeralds: 1040 },
    dropDays: DROP_DAYS,
  }),
  item({
    id: "pumpkin",
    tab: "holiday",
    kind: "board",
    rarity: "epic",
    name: { ru: "Тыквенное поле", en: "Pumpkin field" },
    description: {
      ru: "Осенний шторм: тыквы и лиловый туман.",
      en: "Autumn storm: pumpkins and lilac fog.",
    },
    price: { emeralds: 920 },
    dropDays: DROP_DAYS,
  }),
  item({
    id: "salute",
    tab: "holiday",
    kind: "win",
    rarity: "epic",
    name: { ru: "Салют", en: "Fireworks" },
    description: { ru: "Залп над найденным сигналом.", en: "A salvo over the found signal." },
    price: { emeralds: 980 },
    dropDays: DROP_DAYS,
  }),
  item({
    id: "fence_neon",
    tab: "elements",
    kind: "fence",
    rarity: "rare",
    name: { ru: "Неоновый забор", en: "Neon fence" },
    description: { ru: "Бирюзовая планка с пульсом.", en: "A turquoise bar with a pulse." },
    price: { coins: 4200 },
  }),
  item({
    id: "stream_ice",
    tab: "elements",
    kind: "stream",
    rarity: "rare",
    name: { ru: "Ледяной ручей", en: "Ice stream" },
    description: { ru: "Бледно-голубая вода с инеем.", en: "Pale blue water with frost." },
    price: { coins: 3800 },
  }),
  item({
    id: "buoy_glow",
    tab: "elements",
    kind: "buoy",
    rarity: "exclusive",
    name: { ru: "Светящийся буй", en: "Glowing buoy" },
    description: { ru: "Буй с огоньком.", en: "A buoy with a light." },
    price: { emeralds: 600 },
  }),
  item({
    id: "bomb_star",
    tab: "elements",
    kind: "bomb",
    rarity: "common",
    name: { ru: "Морская звезда", en: "Sea star" },
    description: { ru: "Так выглядит бомба после взрыва.", en: "How a bomb looks after it blows." },
    price: { coins: 2400 },
  }),
  item({
    id: "marker_gold",
    tab: "elements",
    kind: "marker",
    rarity: "common",
    name: { ru: "Золотой маркер", en: "Gold marker" },
    description: { ru: "Маркер найденной цели.", en: "Marker for a found target." },
    price: { coins: 2000 },
  }),
  item({
    id: "reef",
    tab: "boards",
    kind: "board",
    rarity: "rare",
    name: { ru: "Коралловый риф", en: "Coral reef" },
    description: {
      ru: "Бирюзовая вода, коралл и тёплый песок.",
      en: "Turquoise water, coral and warm sand.",
    },
    price: { emeralds: 480 },
  }),
  item({
    id: "creek",
    tab: "boards",
    kind: "board",
    rarity: "epic",
    name: { ru: "Изумрудный ручей", en: "Emerald creek" },
    description: {
      ru: "Водные коридоры, мосты и живой поток.",
      en: "Water corridors, bridges and a living current.",
    },
    price: { emeralds: 1080 },
  }),
  item({
    id: "aurora",
    tab: "boards",
    kind: "board",
    rarity: "legendary",
    name: { ru: "Северное сияние", en: "Northern lights" },
    description: { ru: "Холодный лёд и фиолетовое небо.", en: "Cold ice and a violet sky." },
    price: { emeralds: 1800 },
  }),
  item({
    id: "garden",
    tab: "boards",
    kind: "board",
    rarity: "rare",
    name: { ru: "Сад на закате", en: "Sunset garden" },
    description: {
      ru: "Тёплая зелень, изгороди и золотой свет.",
      en: "Warm greens, hedges and golden light.",
    },
    price: { emeralds: 520 },
  }),
  item({
    id: "fog",
    tab: "boards",
    kind: "board",
    rarity: "common",
    name: { ru: "Туманный маяк", en: "Foggy beacon" },
    description: { ru: "Серый рассвет и голубые огни.", en: "Grey dawn and blue lights." },
    price: { coins: 6000 },
  }),
  item({
    id: "neon",
    tab: "profile",
    kind: "frame",
    rarity: "rare",
    name: { ru: "Неоновая рамка", en: "Neon frame" },
    description: {
      ru: "Бирюзовое свечение вокруг знака.",
      en: "A turquoise glow around your badge.",
    },
    price: { emeralds: 520 },
  }),
  item({
    id: "prism",
    tab: "profile",
    kind: "frame",
    rarity: "legendary",
    name: { ru: "Призматическая рамка", en: "Prismatic frame" },
    description: { ru: "Переливается в дуэлях.", en: "Shimmers in duels." },
    price: { emeralds: 1600 },
  }),
  item({
    id: "navigator",
    tab: "profile",
    kind: "title",
    rarity: "common",
    name: { ru: "Титул «Штурман»", en: "Title “Navigator”" },
    description: { ru: "Над ником в дуэлях.", en: "Above your name in duels." },
    price: { coins: 6000 },
  }),
  item({
    id: "sonar",
    tab: "effects",
    kind: "tap",
    rarity: "common",
    name: { ru: "Сонар", en: "Sonar" },
    description: { ru: "Кольца расходятся от тапа.", en: "Rings spread from each tap." },
    price: { coins: 4000 },
  }),
  item({
    id: "beacon_w",
    tab: "effects",
    kind: "win",
    rarity: "common",
    name: { ru: "Маяк", en: "Beacon" },
    description: { ru: "Луч над сигналом.", en: "A beam over the signal." },
    price: { emeralds: 200 },
  }),
];

export const MOCK_BUNDLES: readonly MockBundle[] = [
  {
    id: "set_storm",
    name: { ru: "Набор «Шторм»", en: "Storm bundle" },
    description: {
      ru: "Поле + забор + эффект. Скидка 35%.",
      en: "Board + fence + effect. 35% off.",
    },
    rarity: "legendary",
    items: ["creek", "fence_neon", "sparks"],
    basePrice: { emeralds: 2340 },
    price: { emeralds: 1520 },
    dropDays: DROP_DAYS,
  },
  {
    id: "set_garden",
    name: { ru: "Набор «Сад»", en: "Garden bundle" },
    description: { ru: "Поле + маркер + эффект победы.", en: "Board + marker + win effect." },
    rarity: "rare",
    items: ["garden", "marker_gold", "beacon_w"],
    basePrice: { emeralds: 900 },
    price: { emeralds: 560 },
    dropDays: null,
  },
];

export const FEATURED_BUNDLE = "set_storm";
