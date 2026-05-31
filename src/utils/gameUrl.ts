import {
  clampLiveMarkCount,
  getDefaultLiveMarkCount,
  getLiveMarkMax,
  getLiveMarkMin,
  getWinLength,
} from '../game/logic';
import { DEFAULT_RULES } from '../game/rules';
import type { AiDifficulty, GameMode, GameRules } from '../game/types';
import { DEFAULT_THEME, isValidTheme, type ThemeId } from '../themes';

const MIN_SIZE = 3;
const MAX_SIZE = 8;
const DEFAULT_SIZE = 3;
const DEFAULT_MODE: GameMode = 'pvp';
const DEFAULT_DIFFICULTY: AiDifficulty = 'medium';

const GAME_PARAM_KEYS = [
  'size',
  'mode',
  'misere',
  'limited',
  'k',
  'gravity',
  'compact',
  'diff',
  'theme',
] as const;

export interface ShareableGameConfig {
  size: number;
  mode: GameMode;
  rules: GameRules;
  aiDifficulty: AiDifficulty;
  theme?: ThemeId;
}

export interface ParsedUrlConfig extends ShareableGameConfig {
  hasParams: boolean;
}

function parseBoolParam(value: string | null): boolean {
  return value === '1' || value === 'true';
}

function parseIntParam(
  value: string | null,
  min: number,
  max: number,
  fallback: number,
): number {
  if (value === null || value === '') return fallback;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < min || n > max) return fallback;
  return n;
}

function parseMode(value: string | null): GameMode {
  return value === 'pvc' ? 'pvc' : DEFAULT_MODE;
}

function parseDifficulty(value: string | null): AiDifficulty {
  if (value === 'easy' || value === 'medium' || value === 'hard') return value;
  return DEFAULT_DIFFICULTY;
}

function parseTheme(value: string | null): ThemeId | undefined {
  if (value && isValidTheme(value)) return value;
  return undefined;
}

function hasGameParams(params: URLSearchParams): boolean {
  return GAME_PARAM_KEYS.some((key) => params.has(key));
}

export function parseParamsToConfig(search: string): ParsedUrlConfig {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(raw);

  const size = parseIntParam(params.get('size'), MIN_SIZE, MAX_SIZE, DEFAULT_SIZE);
  const winLength = getWinLength(size);
  const mode = parseMode(params.get('mode'));

  const misere = parseBoolParam(params.get('misere'));
  const limited = parseBoolParam(params.get('limited'));
  const gravity = parseBoolParam(params.get('gravity'));
  const compactOnExpire =
    limited && gravity ? parseBoolParam(params.get('compact')) : false;

  const defaultK = getDefaultLiveMarkCount(size, winLength);
  let liveMarkCount = defaultK;
  if (limited) {
    const minK = getLiveMarkMin(size, winLength);
    const maxK = getLiveMarkMax(size);
    liveMarkCount = clampLiveMarkCount(
      parseIntParam(params.get('k'), minK, maxK, defaultK),
      size,
      winLength,
    );
  }

  const rules: GameRules = {
    misere,
    limited,
    gravity,
    liveMarkCount,
    compactOnExpire,
  };

  const aiDifficulty = mode === 'pvc' ? parseDifficulty(params.get('diff')) : DEFAULT_DIFFICULTY;
  const theme = parseTheme(params.get('theme'));

  return {
    size,
    mode,
    rules,
    aiDifficulty,
    theme,
    hasParams: hasGameParams(params),
  };
}

export function encodeConfigToParams(config: ShareableGameConfig): URLSearchParams {
  const params = new URLSearchParams();
  const winLength = getWinLength(config.size);
  const defaultK = getDefaultLiveMarkCount(config.size, winLength);

  if (config.size !== DEFAULT_SIZE) {
    params.set('size', String(config.size));
  }

  if (config.mode !== DEFAULT_MODE) {
    params.set('mode', config.mode);
  }

  if (config.rules.misere) {
    params.set('misere', '1');
  }

  if (config.rules.limited) {
    params.set('limited', '1');
    if (config.rules.liveMarkCount !== defaultK) {
      params.set('k', String(config.rules.liveMarkCount));
    }
  }

  if (config.rules.gravity) {
    params.set('gravity', '1');
  }

  if (config.rules.limited && config.rules.gravity && config.rules.compactOnExpire) {
    params.set('compact', '1');
  }

  if (config.mode === 'pvc' && config.aiDifficulty !== DEFAULT_DIFFICULTY) {
    params.set('diff', config.aiDifficulty);
  }

  if (config.theme && config.theme !== DEFAULT_THEME) {
    params.set('theme', config.theme);
  }

  return params;
}

export function buildShareUrl(config: ShareableGameConfig): string {
  const params = encodeConfigToParams(config);
  const base = new URL(import.meta.env.BASE_URL, window.location.origin);
  const query = params.toString();
  return query ? `${base.href}?${query}` : base.href;
}

export function getDefaultShareableConfig(theme: ThemeId): ShareableGameConfig {
  return {
    size: DEFAULT_SIZE,
    mode: DEFAULT_MODE,
    rules: { ...DEFAULT_RULES },
    aiDifficulty: DEFAULT_DIFFICULTY,
    theme,
  };
}
