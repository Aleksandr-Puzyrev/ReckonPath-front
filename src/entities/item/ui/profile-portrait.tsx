import { Image } from "expo-image";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Gradient } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";

import type { ProfileTextures } from "../model/shop-texture";

import { styles } from "./profile-portrait-styles";

interface IProfilePortrait {
  name: string;
  avatar?: ProfileTextures | undefined;
  frame?: ProfileTextures | undefined;
  radius: number;
}

const ProfilePortrait = ({ name, avatar, frame, radius }: IProfilePortrait) => {
  const { rt } = useUnistyles();
  const theme = rt.themeName === "light" ? "light" : "dark";
  const avatarUrl = avatar?.[theme];
  const frameUrl = frame?.[theme];

  return (
    <View style={styles.root}>
      <View style={[styles.avatar, { borderRadius: radius }]}>
        <Gradient name="primary" radius={radius} />
        <Text variant="display.m" style={styles.letter}>
          {name.slice(0, 1).toUpperCase()}
        </Text>
        {avatarUrl !== undefined && (
          <Image
            source={avatarUrl}
            testID="profile-avatar-texture"
            recyclingKey={avatarUrl}
            cachePolicy="disk"
            contentFit="cover"
            style={styles.texture}
          />
        )}
      </View>
      {frameUrl !== undefined && (
        <Image
          source={frameUrl}
          testID="profile-frame-texture"
          recyclingKey={frameUrl}
          cachePolicy="disk"
          contentFit="contain"
          style={styles.texture}
        />
      )}
    </View>
  );
};

export default ProfilePortrait;
