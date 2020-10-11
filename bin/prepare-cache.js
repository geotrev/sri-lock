#!/usr/bin/env node

import path from "path"
import Hashes from "jshashes"
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

let customConfig
const args = process.argv

if (args) {
  args.forEach((arg) => {
    const getVal = (parts) => parts[parts.length - 1]
    if (arg.startsWith("--config=") || arg.startsWith("-c=")) {
      customConfig = getVal(arg.split("="))
    }
  })
}

const paopuConfig = getConfig(customConfig)
const SHA256 = new Hashes.SHA256()
const getSHA = (data) => SHA256.b64(data)
const nextCache = {}

logger.begin("Rebuilding cache...")

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
