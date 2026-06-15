export type OutputFormat = 'terminal' | 'markdown';

export interface CliOptions {
  directory?: string;
  format: OutputFormat;
  output?: string;
  help: boolean;
  version: boolean;
}

const VALID_FORMATS: OutputFormat[] = ['terminal', 'markdown'];

/**
 * Parses raw CLI arguments (process.argv.slice(2)) into structured options.
 * Throws an Error with a friendly message on invalid input.
 */
export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    format: 'terminal',
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;

      case '-v':
      case '--version':
        options.version = true;
        break;

      case '-f':
      case '--format': {
        const value = argv[++i];
        if (!value) {
          throw new Error(`Option "${arg}" requires a value.`);
        }
        if (!isValidFormat(value)) {
          throw new Error(
            `Invalid format "${value}". Valid formats: ${VALID_FORMATS.join(', ')}.`,
          );
        }
        options.format = value;
        break;
      }

      case '-o':
      case '--output': {
        const value = argv[++i];
        if (!value) {
          throw new Error(`Option "${arg}" requires a value.`);
        }
        options.output = value;
        break;
      }

      default: {
        if (arg.startsWith('-')) {
          throw new Error(`Unknown option "${arg}".`);
        }
        if (options.directory) {
          throw new Error(`Unexpected argument "${arg}". Only one directory is supported.`);
        }
        options.directory = arg;
      }
    }
  }

  return options;
}

function isValidFormat(value: string): value is OutputFormat {
  return (VALID_FORMATS as string[]).includes(value);
}