#!/usr/bin/env node

import path from "path"
import Hashes from "jshashes"
import { getArgs } from "./parse-args.js"
import {
  getJSON,
  writeFileContent,
  getFileContent,
  exists,
  normalizeCacheEntry,
  getCache,
  getConfig,
  validCacheEntry,
  CACHE_FILE_NAME,
} from "./helpers.js"
import * as logger from "./logger.js"

logger.begin("Rebuilding cache...")

const cliArgs = getArgs()
const paopuConfig = getConfig(cliArgs.config || cliArgs.c)
const SHA256 = new Hashes.SHA256()
const getSHA = (data) => SHA256.b64(data)
const nextCache = {}

for (let packageName in paopuConfig) {
  const packageConfig = paopuConfig[packageName]
  const normalizedCache = normalizeCacheEntry(packageConfig)

  if (!validCacheEntry(packageName, packageConfig)) {
    continue
  }

  nextCache[packageName] = normalizedCache

  const root = normalizedCache.module
    ? `node_modules/${packageName}`
    : normalizedCache.resourceBasePath

  // Update version

  const pkgJson = `${root}/package.json`
  if (!exists(pkgJson)) {
    logger.err(
      `Package '${packageName}' has unresolvable package.json, skipping`
    )
    continue
  }

  const nextVersion = getJSON(pkgJson).version

  if (nextVersion !== nextCache[packageName].version) {
    nextCache[packageName].version = nextVersion
  }

  // Update SRI hashes

  const length = packageConfig.resources.length
  let index = -1

  while (++index < length) {
    const resource = packageConfig.resources[index]
    const resourcePath = path.resolve(process.cwd(), root, resource)

    if (!exists(resourcePath)) {
      logger.err(`Resource at '${resourcePath}' is unresolvable, skipping`)
      continue
    }

    const resourceContent = getFileContent(resourcePath)
    const computedSRI = `sha256-${getSHA(resourceContent)}`

    nextCache[packageName].resources[resource] = computedSRI
  }
}

const cacheToString = JSON.stringify(nextCache, null, 2)
if (getCache() === cacheToString) {
  logger.finish("Cache unchanged")
} else {
  writeFileContent(CACHE_FILE_NAME, cacheToString)
  logger.finish(`Cache saved to '${process.cwd()}/.paopu-cache'`)
}
