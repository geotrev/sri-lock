#!/usr/bin/env node

import { reporter, message } from "./logger.js"
import { getArgs } from "./parse-args.js"
import { clearCache, getCache, getJSON } from "./helpers.js"
import { writeToTarget } from "./write-to-target.js"

const paopuCache = getJSON(getCache())

const packageNames = Object.keys(paopuCache)
reporter.info(message(`Updating CDN tags for packages: ${packageNames}`))

// Update targets

for (let name in paopuCache) {
  const packageConfig = paopuCache[name]

  packageConfig.targets.forEach((target) =>
    writeToTarget(target, name, packageConfig)
  )
}

const cliArgs = getArgs()
if (!cliArgs.debug && !cliArgs.d) {
  clearCache()
}

reporter.succeed(message("Done! ✨"))
