const tintColorLight = '#007AFF';  
const tintColorDark = '#fff';

export default {

  roles: {
    paramedic: '#007AFF',
    hospital: '#28a745',
  },
  status: {
    available: '#30d158',
    limited: '#ff9f0a',
    unavailable: '#ff453a',
  },

  light: {
    text: '#1c1c1e',
    textSecondary: '#6e6e72',
    background: '#f0f2f5',
    card: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    border: '#e0e0e0',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#a0a0a5',
    background: '#000000',
    card: '#1c1c1e',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    border: '#3a3a3c',
  },
};