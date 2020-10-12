#!/usr/bin/env node

import * as logger from "./logger.js"
import { getCache, getJSON } from "./helpers.js"
import { writeToTarget } from "./update-target.js"

const paopuCache = getJSON(getCache())

const packageNames = Object.keys(paopuCache)
logger.begin("Updating CDN tags:", packageNames)

// Update targets

for (let name in paopuCache) {
  const packageConfig = paopuCache[name]

  packageConfig.targets.forEach((target) =>
    writeToTarget(target, name, packageConfig)
  )
}

logger.finish("CDN tags updated ✨")
logger.empty()
