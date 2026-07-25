/**
 * GroundCheck Mobile — Neumorphic design tokens
 * Mirrored from the web app's --nm-* CSS custom properties in index.css
 */

const colors = {
  light: {
    // Core neumorphic surface
    background: '#e0e5ec',      // --nm-base
    foreground: '#3c4a5c',      // --nm-fg
    mutedForeground: '#7a8ca0', // --nm-fg-muted

    // Cards share the same molded surface
    card: '#e0e5ec',
    cardForeground: '#3c4a5c',

    // Primary action — muted blue accent
    primary: '#7b9ccc',         // --nm-accent
    primaryForeground: '#ffffff',

    // Secondary / subdued
    secondary: '#d4d9e3',
    secondaryForeground: '#3c4a5c',

    // Muted / placeholder
    muted: '#d4d9e3',

    // Accent highlights
    accent: '#7b9ccc',
    accentForeground: '#ffffff',

    // Destructive
    destructive: '#c04040',
    destructiveForeground: '#ffffff',

    // Borders
    border: '#b8c0cc',          // --nm-dark
    input: '#e0e5ec',

    // Legacy aliases for compatibility
    text: '#3c4a5c',
    tint: '#7b9ccc',

    // Shadow colors for neumorphic effect
    nmDark: '#b8c0cc',          // dark shadow (bottom-right)
    nmLight: '#ffffff',         // light highlight (top-left)
  },

  // Border radius — matches web --radius: 1rem = 16px
  radius: 16,
};

export default colors;
