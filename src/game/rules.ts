import {
  getDefaultLiveMarkCount,
  getLiveMarkMin,
} from './logic';
import type { GameRules, RulesPreset } from './types';

export const DEFAULT_RULES: GameRules = {
  misere: false,
  limited: false,
  liveMarkCount: 4,
  gravity: false,
  compactOnExpire: false,
};

export function createRulesFromPreset(
  preset: Exclude<RulesPreset, 'custom'>,
  size: number,
  winLength: number,
): GameRules {
  const minK = getLiveMarkMin(size, winLength);
  const defaultK = getDefaultLiveMarkCount(size, winLength);

  switch (preset) {
    case 'classic':
      return {
        misere: false,
        limited: false,
        liveMarkCount: defaultK,
        gravity: false,
        compactOnExpire: false,
      };
    case 'misere':
      return {
        misere: true,
        limited: false,
        liveMarkCount: defaultK,
        gravity: false,
        compactOnExpire: false,
      };
    case 'connect4':
      return {
        misere: false,
        limited: false,
        liveMarkCount: defaultK,
        gravity: true,
        compactOnExpire: false,
      };
    case 'connect4Limited':
      return {
        misere: false,
        limited: true,
        liveMarkCount: defaultK,
        gravity: true,
        compactOnExpire: true,
      };
    case 'limited':
      return {
        misere: false,
        limited: true,
        liveMarkCount: defaultK,
        gravity: false,
        compactOnExpire: false,
      };
    case 'chaos':
      return {
        misere: true,
        limited: true,
        liveMarkCount: minK,
        gravity: false,
        compactOnExpire: false,
      };
  }
}

export function detectPreset(rules: GameRules, size: number, winLength: number): RulesPreset {
  const minK = getLiveMarkMin(size, winLength);
  const defaultK = getDefaultLiveMarkCount(size, winLength);

  if (!rules.misere && !rules.limited && !rules.gravity) return 'classic';
  if (rules.misere && !rules.limited && !rules.gravity) return 'misere';
  if (
    !rules.misere &&
    !rules.limited &&
    rules.gravity &&
    !rules.compactOnExpire
  ) {
    return 'connect4';
  }
  if (
    !rules.misere &&
    rules.limited &&
    rules.gravity &&
    rules.compactOnExpire &&
    rules.liveMarkCount === defaultK
  ) {
    return 'connect4Limited';
  }
  if (!rules.misere && rules.limited && !rules.gravity && rules.liveMarkCount === defaultK) {
    return 'limited';
  }
  if (rules.misere && rules.limited && !rules.gravity && rules.liveMarkCount === minK) {
    return 'chaos';
  }
  return 'custom';
}

export function formatRulesLabel(rules: GameRules): string {
  const parts: string[] = [];
  if (rules.misere) parts.push('Misère');
  if (rules.limited) parts.push(`Limited K=${rules.liveMarkCount}`);
  if (rules.gravity) parts.push('Gravity');
  if (rules.gravity && rules.limited && rules.compactOnExpire) {
    parts.push('Fall on expire');
  }
  return parts.length > 0 ? parts.join(' · ') : 'Classic';
}
