import { at } from 'apil';

export interface AcceptConfig {
  ignores: Array<at.UserId>
  variants: Array<at.VariantKey>
  noRated: boolean
  noUnrated: boolean
  controls: Array<at.TimeControlShow>
}

export type AcceptOptions = Partial<AcceptConfig>

const defaultConfig: AcceptConfig = {
  ignores: [],
  variants: ['standard'],
  noRated: false,
  noUnrated: false,
  controls: ['1+0', '3+0', '3+2', '5+0', '5+3', '10+0']
}

export function acceptConfig(opts: AcceptOptions): AcceptConfig {
  return {
    ...defaultConfig,
    ...opts
  };
}

export function canAccept({ challenge }: at.Challenge, config: AcceptConfig): at.DeclineReason | undefined {
  if (config.ignores.includes(challenge.challenger.id)) {
    return 'generic';
  }
  if (!config.variants.includes(challenge.variant.key)) {
    return 'variant';
  }
  if (config.noRated && challenge.rated) {
    return 'rated'
  }
  if (config.noUnrated && !challenge.rated) {
    return 'casual';
  }
  if (!config.controls.includes(challenge.timeControl.show)) {
    return 'timeControl'
  }
}
