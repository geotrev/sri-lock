#!/usr/bin/env node

import * as logger from "./logger.js"
import { getArgs } from "./parse-args.js"
import { clearCache, getCache, getJSON } from "./helpers.js"
import { writeToTarget } from "./write-to-target.js"

const paopuCache = getJSON(getCache())

const packageNames = Object.keys(paopuCache)
logger.begin("⌛ Updating CDN tags for packages:", packageNames)

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

logger.finish("✅ CDN tags updated")
logger.empty()
