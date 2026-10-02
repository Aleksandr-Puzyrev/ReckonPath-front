import type { ComponentType, ReactNode } from "react";
import { View } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";

import SystemIllustration from "./system-illustration";
import type { IllustrationTone } from "./system-illustration";
import { styles } from "./system-message-styles";

interface ISystemMessage {
  tone: IllustrationTone;
  Icon: ComponentType<SvgProps>;
  title: string;
  body: string | null;
  children: ReactNode;
}

const SystemMessage = ({ tone, Icon, title, body, children }: ISystemMessage) => (
  <Screen style={styles.screen}>
    <SystemIllustration tone={tone} Icon={Icon} />
    <Text variant="display.m" accessibilityRole="header" style={styles.title}>
      {title}
    </Text>
    {body === null ? null : (
      <Text variant="body.m" style={styles.body}>
        {body}
      </Text>
    )}
    <View style={styles.actions}>{children}</View>
  </Screen>
);

export default SystemMessage;
