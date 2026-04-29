export const VAR_PATTERN_SOURCE = '[\\w.$-]+(?::[\\w-]+)?'
export const VAR_PATTERN = new RegExp(`\\{\\{(${VAR_PATTERN_SOURCE})\\}\\}`, 'g')
export const VAR_EXACT = new RegExp(`^\\{\\{(${VAR_PATTERN_SOURCE})\\}\\}$`)
export const VAR_INCOMPLETE = new RegExp(`\\{\\{([\\w.$-]*)$`)