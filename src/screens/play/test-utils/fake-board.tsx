import { Pressable, Text, View } from "react-native";

const CELLS = 16;

interface IFakeBoard {
  onCellPress: (idx: number) => void;
  onCellLongPress: (idx: number) => void;
  showHidden: boolean;
}

export const Board = ({ onCellPress, onCellLongPress, showHidden }: IFakeBoard) => (
  <View>
    {Array.from({ length: CELLS }, (_, idx) => (
      <Pressable
        key={idx}
        testID={`cell-${idx}`}
        onPress={() => onCellPress(idx)}
        onLongPress={() => onCellLongPress(idx)}
      />
    ))}
    {showHidden ? <Text testID="hidden-shown" /> : null}
  </View>
);

export const useBoardFx = () => ({ play: () => undefined });

export const BoardDemo = () => null;
