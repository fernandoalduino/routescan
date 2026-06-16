const CODES = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
} as const;

type ColorName = keyof typeof CODES;

export function shouldUseColor(stream: NodeJS.WriteStream = process.stdout): boolean {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return Boolean(stream.isTTY);
}

export function createColorizer(enabled: boolean) {
  return (text: string, color: ColorName): string => {
    if (!enabled) return text;
    return `${CODES[color]}${text}${CODES.reset}`;
  };
}

export type Colorize = ReturnType<typeof createColorizer>;