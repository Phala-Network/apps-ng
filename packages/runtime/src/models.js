import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'

export const kRegexpEnumName = /^[A-Z][A-Za-z0-9]*$/

export function fromApi (obj) {
  return camelcaseKeys(obj, { deep: true, exclude: [kRegexpEnumName] })
}

export function toApi (obj) {
  return snakecaseKeys(obj, { deep: true, exclude: [kRegexpEnumName] })
}
