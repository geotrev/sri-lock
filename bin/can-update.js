import * as logger from "./logger.js"

export const canUpdate = (name, root, resources) => {
  let canUpdate = true

  /* eslint-disable no-console */
  if (!root) {
    logger.print(
      `--> CDN resource ${name} missing key: 'root', skipping.`,
      "warn"
    )
    canUpdate = false
  }

  if (!Array.isArray(resources) || !resources.length) {
    canUpdate = false
  }
  /* eslint-enable no-console */

  return canUpdate
}
