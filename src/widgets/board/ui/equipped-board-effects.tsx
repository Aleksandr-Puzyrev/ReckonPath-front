import { useQueries } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import type { Idx } from "@reckon-path/engine";

import {
  LottieView,
  equippedAnimationsOf,
  shopAnimationOptions,
  useInventoryQuery,
} from "@entities/item";
import type { AnimationTheme, EffectSlot, ShopAnimationSource } from "@entities/item";

import { cellOrigin } from "../model/board-geometry";
import type { BoardGeometry } from "../model/board-geometry";
import type { BoardFx } from "../model/use-board-fx";

interface IEquippedBoardEffects {
  geometry: BoardGeometry;
  fx: BoardFx;
}

interface ActiveEffect {
  id: number;
  slot: EffectSlot;
  cell: Idx;
  source: ShopAnimationSource;
  animation: AnimationTheme;
}

const MAX_ACTIVE_EFFECTS = 2;

const BoardEffectView = ({
  effect,
  geometry,
  onFinish,
}: {
  effect: ActiveEffect;
  geometry: BoardGeometry;
  onFinish: () => void;
}) => {
  const { theme } = useUnistyles();
  const reducedMotion = useReducedMotion();
  const { equippedTap, targetFound, win } = theme.motion.animation;
  const limits = { fxClick: equippedTap, fxReveal: targetFound, fxVictory: win };
  const sourceDuration = ((effect.source.op - effect.source.ip) / effect.source.fr) * 1000;
  const speed = Math.max(1, sourceDuration / limits[effect.slot]);
  const duration = reducedMotion ? theme.motion.duration.base : sourceDuration / speed;
  const finish = useRef(onFinish);

  useEffect(() => {
    finish.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const timer = setTimeout(() => finish.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (LottieView === null) return null;
  const { x, y } = cellOrigin(geometry, effect.cell);
  const bounds =
    effect.slot === "fxVictory"
      ? { left: 0, top: 0, width: geometry.width, height: geometry.height }
      : { left: x, top: y, width: geometry.cell, height: geometry.cell };

  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", ...bounds }}
    >
      <LottieView
        testID={effect.slot}
        source={effect.source}
        colorFilters={effect.animation.colorFilters}
        speed={speed}
        autoPlay={!reducedMotion}
        {...(reducedMotion ? { progress: 1 } : {})}
        loop={false}
        onAnimationFailure={onFinish}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const EquippedBoardEffects = ({ geometry, fx }: IEquippedBoardEffects) => {
  const { rt } = useUnistyles();
  const { data: inventory } = useInventoryQuery();
  const equipped = equippedAnimationsOf(inventory, rt.themeName === "light" ? "light" : "dark");
  const urls = Array.from(new Set(equipped.map(({ animation }) => animation.url)));
  const compositions = useQueries({ queries: urls.map(shopAnimationOptions) });
  const [effects, setEffects] = useState<ActiveEffect[]>([]);
  const nextId = useRef(0);
  const { subscribeEffects } = fx;

  useEffect(
    () =>
      subscribeEffects((cell, slots) => {
        const ready = equipped.flatMap(({ slot, animation }) => {
          const source = compositions[urls.indexOf(animation.url)]?.data;
          return source === undefined || !slots.includes(slot)
            ? []
            : [{ id: ++nextId.current, slot, cell, source, animation }];
        });
        if (ready.length === 0) return;
        setEffects((current) =>
          [...current.filter(({ slot }) => !slots.includes(slot)), ...ready].slice(
            -MAX_ACTIVE_EFFECTS,
          ),
        );
      }),
    [subscribeEffects, equipped, compositions, urls],
  );

  return effects.map((effect) => (
    <BoardEffectView
      key={effect.id}
      effect={effect}
      geometry={geometry}
      onFinish={() => setEffects((current) => current.filter(({ id }) => id !== effect.id))}
    />
  ));
};

export default EquippedBoardEffects;
