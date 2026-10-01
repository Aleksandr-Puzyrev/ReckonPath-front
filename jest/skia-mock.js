const { View } = require("react-native");

const Noop = () => null;

module.exports = {
  Canvas: View,
  Group: View,
  Picture: Noop,
  RoundedRect: View,
  LinearGradient: Noop,
  vec: (x, y) => ({ x, y }),
  createPicture: () => null,
  useFont: () => null,
};
