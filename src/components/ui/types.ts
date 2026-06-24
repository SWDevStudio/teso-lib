export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'ghost'

export interface FilterChipOption {
  value: string | number
  label: string
  color?: BadgeColor
}
