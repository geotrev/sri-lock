#!/usr/bin/env node

import { reporter, message } from "./logger.js"
import { writeFileContent, CACHE_FILE_NAME } from "./helpers.js"
import { buildCache } from "./build-cache.js"

reporter.info(message("Verifying config"))

const nextCache = buildCache()
const cacheToString = JSON.stringify(nextCache, null, 2)

writeFileContent(CACHE_FILE_NAME, cacheToString)
