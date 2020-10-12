#!/usr/bin/env node

import * as logger from "./logger.js"
import { writeFileContent, getCache, CACHE_FILE_NAME } from "./helpers.js"
import { buildCache } from "./build-cache.js"

logger.empty()
logger.begin("Rebuilding cache...")

const nextCache = buildCache()
const cacheToString = JSON.stringify(nextCache, null, 2)
if (getCache() === cacheToString) {
  logger.finish("Cache unchanged")
} else {
  writeFileContent(CACHE_FILE_NAME, cacheToString)
  logger.finish(`Cache saved to '${process.cwd()}/.paopu-cache'`)
}
