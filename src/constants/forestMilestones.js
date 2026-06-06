export const FOREST_MILESTONES = [
  {
    day: 0,
    label: 'Arrival',
    unlocks: ['tent', 'campfire_lv1', 'kodu'],
    description: "We'll grow this place together.",
  },
  {
    day: 2,
    label: 'First Bloom',
    unlocks: ['flower_1'],
    description: 'A flower blooms because you showed up.',
  },
  {
    day: 3,
    label: 'Visitor',
    unlocks: ['butterfly_1'],
    description: 'A butterfly visits your garden.',
  },
  {
    day: 7,
    label: 'Steady Flame',
    unlocks: ['campfire_lv2'],
    description: 'Your campfire burns brighter.',
  },
  {
    day: 10,
    label: 'Emotional Weather',
    unlocks: ['weather_system'],
    description: 'The forest reflects your feelings.',
  },
  {
    day: 14,
    label: 'New Friend',
    unlocks: ['squirrel'],
    description: 'A squirrel arrives.',
  },
  {
    day: 20,
    label: 'Flowing Water',
    unlocks: ['river'],
    description: 'A river flows through the forest.',
  },
  {
    day: 30,
    label: 'Family',
    unlocks: ['fox_family'],
    description: 'A fox family moves in.',
  },
  {
    day: 45,
    label: 'Changing Seasons',
    unlocks: ['season_change'],
    description: 'The seasons begin to change.',
  },
  {
    day: 60,
    label: 'Hidden Grove',
    unlocks: ['secret_grove'],
    description: 'You discover a hidden grove.',
  },
  {
    day: 90,
    label: 'Night Sky',
    unlocks: ['observatory'],
    description: 'The night sky opens above you.',
  },
];

export const FOREST_OBJECTS = {
  tent: { emoji: '🏕️', label: 'Tent', position: { bottom: '20%', left: '30%' } },
  campfire_lv1: { emoji: '🔥', label: 'Small Campfire', position: { bottom: '25%', right: '30%' } },
  campfire_lv2: { emoji: '🔥', label: 'Steady Campfire', position: { bottom: '25%', right: '30%' } },
  flower_1: { emoji: '🌸', label: 'Flower', position: { bottom: '15%', left: '15%' } },
  butterfly_1: { emoji: '🦋', label: 'Butterfly', position: { top: '30%', left: '20%' } },
  squirrel: { emoji: '🐿️', label: 'Squirrel', position: { bottom: '30%', left: '50%' } },
  river: { emoji: '🌊', label: 'River', position: { bottom: '10%', left: '0%' } },
  fox_family: { emoji: '🦊', label: 'Fox Family', position: { bottom: '35%', right: '15%' } },
  secret_grove: { emoji: '🌲', label: 'Secret Grove', position: { top: '15%', right: '10%' } },
  observatory: { emoji: '⭐', label: 'Night Observatory', position: { top: '5%', left: '40%' } },
};
