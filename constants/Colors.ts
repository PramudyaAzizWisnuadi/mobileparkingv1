/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#228B22'; // Forest Green
const tintColorDark = '#90EE90'; // Light Green

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F8FFF8', // Very light green background
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#228B22', // Forest Green
    secondary: '#DC143C', // Crimson Red
    accent: '#32CD32', // Lime Green
    success: '#228B22',
    error: '#DC143C',
    warning: '#FF8C00',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F1F0F', // Very dark green background
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#32CD32', // Lime Green for dark mode
    secondary: '#FF6B6B', // Lighter red for dark mode
    accent: '#90EE90', // Light Green
    success: '#32CD32',
    error: '#FF6B6B',
    warning: '#FFA500',
  },
};
