#!/usr/bin/env node

import * as logger from "./logger.js"
import { writeFileContent, CACHE_FILE_NAME } from "./helpers.js"
import { buildCache } from "./build-cache.js"

logger.empty()
logger.begin("⏳ Verifying config")

const nextCache = buildCache()
const cacheToString = JSON.stringify(nextCache, null, 2)

writeFileContent(CACHE_FILE_NAME, cacheToString)
