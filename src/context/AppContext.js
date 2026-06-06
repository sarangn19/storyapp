import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getData, setData } from '../utils/storage';
import { FOREST_MILESTONES } from '../constants/forestMilestones';

const AppContext = createContext();

function getDayCount(joinDate) {
  if (!joinDate) return 0;
  const joined = new Date(joinDate);
  const now = new Date();
  const diff = Math.floor((now - joined) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function getUnlockedObjects(dayCount) {
  const unlocked = new Set();
  FOREST_MILESTONES.forEach((m) => {
    if (dayCount >= m.day) {
      m.unlocks.forEach((u) => unlocked.add(u));
    }
  });
  return unlocked;
}

function getCurrentMilestone(dayCount) {
  let current = FOREST_MILESTONES[0];
  for (const m of FOREST_MILESTONES) {
    if (dayCount >= m.day) current = m;
  }
  return current;
}

function detectPattern(moods) {
  const recent = moods.slice(-7);
  if (recent.length < 3) return null;
  const counts = {};
  recent.forEach((m) => {
    counts[m.mood] = (counts[m.mood] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 4) return top[0];
  return null;
}

function getWeather(mood, unlockedObjects) {
  if (!unlockedObjects.has('weather_system')) return 'clear';
  switch (mood) {
    case 'great': return 'sunny';
    case 'okay': return 'clear';
    case 'anxious': return 'foggy';
    case 'low': return 'rainy';
    case 'drained': return 'night';
    default: return 'clear';
  }
}

function getFlowerEmoji(count) {
  const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿'];
  return flowers[count % flowers.length];
}

const initialState = {
  user: null,
  joinDate: null,
  dayCount: 0,
  mood: null,
  moods: [],
  gratitudes: [],
  journals: [],
  breathingSessions: 0,
  cbtEntries: [],
  therapySessionCount: 0,
  focusSessions: 0,
  memories: [],
  unlockedObjects: new Set(['tent', 'campfire_lv1', 'kodu']),
  currentMilestone: FOREST_MILESTONES[0],
  weather: 'clear',
  pattern: null,
  koduMessages: [],
  isFirstLaunch: true,
  treesCount: 0,
  flowerCount: 0,
  recentEvent: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE': {
      const dayCount = getDayCount(action.payload.joinDate);
      const unlocked = getUnlockedObjects(dayCount);
      const recentMood = action.payload.moods?.[action.payload.moods.length - 1]?.mood;
      return {
        ...state,
        ...action.payload,
        dayCount,
        unlockedObjects: unlocked,
        currentMilestone: getCurrentMilestone(dayCount),
        weather: getWeather(recentMood, unlocked),
        pattern: detectPattern(action.payload.moods || []),
        mood: recentMood || null,
      };
    }
    case 'SET_FIRST_LAUNCH':
      return { ...state, isFirstLaunch: action.payload };
    case 'START_JOURNEY': {
      const now = new Date().toISOString();
      return {
        ...state,
        user: action.payload,
        joinDate: now,
        dayCount: 0,
        isFirstLaunch: false,
      };
    }
    case 'ADD_MOOD': {
      const today = new Date().toDateString();
      const existing = (state.moods || []).filter((m) => m.date !== today);
      const newMoods = [...existing, { ...action.payload, date: today }];
      const recentMood = action.payload.mood;
      const dayCount = getDayCount(state.joinDate);
      return {
        ...state,
        moods: newMoods,
        mood: recentMood,
        weather: getWeather(recentMood, state.unlockedObjects),
        pattern: detectPattern(newMoods),
      };
    }
    case 'ADD_GRATITUDE': {
      const flowerCount = state.flowerCount + 1;
      const memories = [
        ...state.memories,
        { type: 'gratitude', text: action.payload.text, date: new Date().toISOString(), emoji: getFlowerEmoji(flowerCount - 1) },
      ];
      return {
        ...state,
        gratitudes: [...(state.gratitudes || []), { ...action.payload, date: new Date().toISOString() }],
        flowerCount,
        memories,
        recentEvent: { type: 'flower', message: 'A new flower has bloomed 🌸' },
      };
    }
    case 'ADD_JOURNAL': {
      const treesCount = state.treesCount + 1;
      const memories = [
        ...state.memories,
        { type: 'journal', text: action.payload.text, date: new Date().toISOString(), emoji: '🌲' },
      ];
      return {
        ...state,
        journals: [...(state.journals || []), { ...action.payload, date: new Date().toISOString() }],
        treesCount,
        memories,
        recentEvent: { type: 'tree', message: 'A tree grows taller 🌲' },
      };
    }
    case 'ADD_BREATHING': {
      const count = (state.breathingSessions || 0) + 1;
      return {
        ...state,
        breathingSessions: count,
        recentEvent: { type: 'clear', message: 'The clouds are getting lighter 🌤️' },
      };
    }
    case 'ADD_FOCUS': {
      return {
        ...state,
        focusSessions: (state.focusSessions || 0) + 1,
        recentEvent: { type: 'fire', message: 'The fire is glowing bright 🔥' },
      };
    }
    case 'ADD_CBT':
      return {
        ...state,
        cbtEntries: [...(state.cbtEntries || []), { ...action.payload, date: new Date().toISOString() }],
      };
    case 'ADD_MEMORY':
      return {
        ...state,
        memories: [...(state.memories || []), { ...action.payload, date: new Date().toISOString() }],
      };
    case 'ADD_KODU_MESSAGE':
      return { ...state, koduMessages: [...(state.koduMessages || []), action.payload] };
    case 'CLEAR_EVENT':
      return { ...state, recentEvent: null };
    case 'TICK_DAY': {
      const dayCount = getDayCount(state.joinDate);
      const unlocked = getUnlockedObjects(dayCount);
      const milestone = getCurrentMilestone(dayCount);
      const justUnlocked = [...unlocked].filter((u) => !state.unlockedObjects.has(u));
      return {
        ...state,
        dayCount,
        unlockedObjects: unlocked,
        currentMilestone: milestone,
        recentEvent: justUnlocked.length > 0
          ? { type: 'milestone', message: `${milestone.description}` }
          : state.recentEvent,
      };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (state.joinDate) {
      persistState();
    }
  }, [state.joinDate, state.moods, state.gratitudes, state.journals, state.memories, state.koduMessages, state.breathingSessions, state.focusSessions, state.cbtEntries, state.flowerCount, state.treesCount]);

  useEffect(() => {
    if (state.joinDate) {
      dispatch({ type: 'TICK_DAY' });
    }
  }, [state.joinDate]);

  async function loadState() {
    const saved = await getData('USER');
    if (saved) {
      dispatch({ type: 'RESTORE', payload: saved });
    }
    const first = await getData('FIRST_LAUNCH');
    if (first === false) {
      dispatch({ type: 'SET_FIRST_LAUNCH', payload: false });
    }
  }

  async function persistState() {
    await setData('USER', {
      user: state.user,
      joinDate: state.joinDate,
      moods: state.moods,
      gratitudes: state.gratitudes,
      journals: state.journals,
      memories: state.memories,
      koduMessages: state.koduMessages,
      breathingSessions: state.breathingSessions,
      focusSessions: state.focusSessions,
      cbtEntries: state.cbtEntries,
      flowerCount: state.flowerCount,
      treesCount: state.treesCount,
    });
    await setData('FIRST_LAUNCH', false);
  }

  const completeFirstLaunch = useCallback((name) => {
    dispatch({ type: 'START_JOURNEY', payload: name });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, completeFirstLaunch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
