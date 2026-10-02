import { FlashList } from "@shopify/flash-list";
import type { FlashListRef, ViewToken } from "@shopify/flash-list";
import type { ReactElement } from "react";
import { useRef, useState } from "react";
import { View } from "react-native";

import type { LevelItem, ListItem } from "../model/build-list-items";
import { currentItemIndex } from "../model/build-list-items";
import { jumpDirectionOf } from "../model/jump-direction";

import LevelRow from "./level-row";
import { styles } from "./level-list-styles";
import ToCurrentButton from "./to-current-button";
import WorldHeader from "./world-header";

interface ILevelList {
  items: readonly ListItem[];
  header: ReactElement;
  onLevelPress: (item: LevelItem) => void;
}

const CENTER = 0.5;

const LevelList = ({ items, header, onLevelPress }: ILevelList) => {
  const listRef = useRef<FlashListRef<ListItem>>(null);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const currentIndex = currentItemIndex(items);
  const direction = jumpDirectionOf(currentIndex, visibleIndexes);

  const scrollToCurrent = (animated: boolean) => {
    if (currentIndex === null) return;
    void listRef.current?.scrollToIndex({ index: currentIndex, animated, viewPosition: CENTER });
  };

  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<ListItem>[];
  }) => setVisibleIndexes(viewableItems.flatMap(({ index }) => (index === null ? [] : [index])));

  return (
    <View style={styles.container}>
      <FlashList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.key}
        getItemType={(item) => item.type}
        ListHeaderComponent={header}
        contentContainerStyle={styles.content}
        onLoad={() => scrollToCurrent(false)}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderItem={({ item }) =>
          item.type === "world" ? (
            <WorldHeader item={item} />
          ) : (
            <View style={styles.row}>
              <LevelRow item={item} onPress={onLevelPress} />
            </View>
          )
        }
      />
      {direction === null ? null : (
        <ToCurrentButton direction={direction} onPress={() => scrollToCurrent(true)} />
      )}
    </View>
  );
};

export default LevelList;
