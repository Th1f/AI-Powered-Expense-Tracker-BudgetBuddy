// Theme.tsx - Centralized theme constants for BudgetBuddy
export interface ColorTheme {
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  warning: string;
  danger: string;
  error: string;
  border: string;
  disabledBackground: string;
  body: string;
  header: string;
  caption: string;
  title: string;
  subheader: string;
}

export interface SpacingTheme {
  xs: number;
  s: number;
  m: number;
  l: number;
  xl: number;
  xxl: number;
  xxxl: number;
  xxxxl: number;
}

export interface FontSizeTheme {
  xs: number;
  s: number;
  caption: number;
  body: number;
  button: number;
  subheader: number;
  header: number;
  title: number;
  largeTitle: number;
}

export interface BorderRadiusTheme {
  xs: number;
  s: number;
  m: number;
  l: number;
  xl: number;
  round: number;
}

export interface ShadowTheme {
  small: {
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  medium: {
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  large: {
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

// Color scheme focused on trust and financial growth with blue/green tones
export const Colors: ColorTheme = {
  primary: '#3B82F6',          // Main blue
  primaryLight: '#DBEAFE',     // Light blue
  secondary: '#10B981',        // Green
  accent: '#8B5CF6',           // Purple
  background: '#F9FAFB',       // Light gray background
  cardBackground: '#FFFFFF',   // White
  textPrimary: '#1F2937',      // Dark gray
  textSecondary: '#6B7280',    // Medium gray
  success: '#10B981',          // Green
  warning: '#F59E0B',          // Amber
  danger: '#F97316',           // Orange
  error: '#EF4444',            // Red
  border: '#E5E7EB',           // Light gray
  disabledBackground: '#F3F4F6', // Light gray for disabled elements
  body: '#F9FAFB',             // Light gray
  header: '#1F2937',           // Dark gray
  caption: '#6B7280',          // Medium gray
  title: '#1F2937',            // Dark gray
  subheader: '#6B7280',        // Medium gray
};

// Spacing used throughout the app
export const Spacing: SpacingTheme = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
  xxxxl: 72
};

// Font sizes used throughout the app
export const FontSize: FontSizeTheme = {
  xs: 10,
  s: 12,
  caption: 12,
  body: 14,
  button: 16,
  subheader: 18,
  header: 20,
  title: 24,
  largeTitle: 32
};

// Border radius used throughout the app
export const BorderRadius: BorderRadiusTheme = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  round: 9999 // Very large number for fully rounded elements
};

// Shadow styles for elevation
export const Shadow: ShadowTheme = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};
