export const BADGE_COLORS = [
  'primary',
  'secondary',
  'accent',
  'neutral',
  'info',
  'success',
  'warning',
  'error',
  'ghost',
] as const

export type BadgeColor = (typeof BADGE_COLORS)[number]

const BADGE_COLOR_SET = new Set<string>(BADGE_COLORS)

function isBadgeColor(value: string): value is BadgeColor {
  return BADGE_COLOR_SET.has(value)
}

export function toBadgeColor(value: string): BadgeColor {
  return isBadgeColor(value) ? value : 'neutral'
}

export interface FilterChipOption<T extends string | number = string | number> {
  value: T
  label: string
  color?: BadgeColor
}
