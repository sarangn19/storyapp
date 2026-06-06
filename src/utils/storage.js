import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@oppam/user',
  MOODS: '@oppam/moods',
  GARDEN: '@oppam/garden',
  FOCUS: '@oppam/focus',
  CBT: '@oppam/cbt',
  BREATHING: '@oppam/breathing',
  ACHIEVEMENTS: '@oppam/achievements',
  STREAK: '@oppam/streak',
  FIRST_LAUNCH: '@oppam/first_launch',
  KODU_MESSAGES: '@oppam/kodu_messages',
  JOURNEY: '@oppam/journey',
};

export async function getData(key) {
  try {
    const raw = await AsyncStorage.getItem(KEYS[key] || key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setData(key, value) {
  try {
    await AsyncStorage.setItem(KEYS[key] || key, JSON.stringify(value));
  } catch {}
}

export async function clearAll() {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch {}
}
