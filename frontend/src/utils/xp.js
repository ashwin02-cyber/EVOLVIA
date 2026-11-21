/**
 * EVOLVIA Gamification XP & Level Calculations (SRS Section 16.2 & 16.3)
 */

export function getXPNeededForLevel(level) {
  return 250 * level;
}

export function getCumulativeXPForLevel(level) {
  return 125 * level * (level - 1);
}

export function calculateLevelFromXP(totalXP) {
  if (totalXP <= 0) return 1;
  const level = Math.floor((1 + Math.sqrt(1 + (4 * totalXP) / 125)) / 2);
  return Math.min(Math.max(1, level), 100);
}

export function getLevelProgress(totalXP) {
  const level = calculateLevelFromXP(totalXP);
  const cumCurrent = getCumulativeXPForLevel(level);
  const xpInLevel = Math.max(0, totalXP - cumCurrent);
  const xpNeeded = getXPNeededForLevel(level);
  const progressPct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return {
    level,
    totalXP,
    xpInLevel,
    xpNeeded,
    progressPct,
    rank: getRankForLevel(level)
  };
}

export function getRankForLevel(level) {
  if (level <= 4) return 'Quest Novice';
  if (level <= 9) return 'Apprentice';
  if (level <= 19) return 'Productivity Explorer';
  if (level <= 34) return 'Quest Adept';
  if (level <= 59) return 'Strategist';
  return 'Evolved Master';
}

export const DIFFICULTY_XP = {
  EASY: 25,
  MEDIUM: 50,
  HARD: 100,
  EPIC: 150
};
