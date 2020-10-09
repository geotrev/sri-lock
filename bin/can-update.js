import * as logger from "./logger.js"

export const canUpdate = (name, rootPath, module, resources) => {
  let canUpdate = true

  /* eslint-disable no-console */
  if (!rootPath && !module) {
    logger.print(
      `--> Neither 'module: true' nor 'path' options given, skipping.`,
      "warn"
    )
    canUpdate = false
  }

  if (rootPath && module) {
    logger.print(
      `--> Both 'module' and 'path' options were given (you can only specify one!), skipping.`
    )
  }

  if (!Array.isArray(resources) || !resources.length) {
    canUpdate = false
  }
  /* eslint-enable no-console */

  return canUpdate
}
