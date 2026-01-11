// API Configuration
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' 
  : ''; // Use proxy in development

// SDG Colors
export const SDG_COLORS = {
  1: '#E5243B', // No Poverty
  2: '#DDA63A', // Zero Hunger
  3: '#4C9F38', // Good Health and Well-being
  4: '#C5192D', // Quality Education
  5: '#FF3A21', // Gender Equality
  6: '#26BDE2', // Clean Water and Sanitation
  7: '#FCC30B', // Affordable and Clean Energy
  8: '#A21942', // Decent Work and Economic Growth
  9: '#FD6925', // Industry, Innovation and Infrastructure
  10: '#DD1367', // Reduced Inequalities
  11: '#FD9D24', // Sustainable Cities and Communities
  12: '#BF8B2E', // Responsible Consumption and Production
  13: '#3F7E44', // Climate Action
  14: '#0A97D9', // Life Below Water
  15: '#56C02B', // Life on Land
  16: '#00689D', // Peace, Justice and Strong Institutions
  17: '#19486A'  // Partnerships for the Goals
};

// Application Theme
export const THEME = {
  primary: '#3B82F6',     // Blue
  secondary: '#8B5CF6',   // Purple
  accent: '#F59E0B',      // Amber
  success: '#10B981',     // Emerald
  warning: '#F59E0B',     // Amber
  error: '#EF4444',       // Red
  background: '#F9FAFB',  // Gray-50
  text: {
    primary: '#1F2937',   // Gray-800
    secondary: '#6B7280', // Gray-500
    light: '#F9FAFB'      // Gray-50
  }
};

// Other configurations
export const APP_NAME = 'CreativeCodingHub';
export const DEFAULT_AVATAR = 'https://via.placeholder.com/150';

// Token configuration
export const TOKEN_KEY = 'token';
export const TOKEN_PREFIX = 'Bearer';