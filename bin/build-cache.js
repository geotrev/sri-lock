#!/usr/bin/env node

import path from "path"
import Hashes from "jshashes"
import { getArgs } from "./parse-args.js"
import {
  getJSON,
  getFileContent,
  exists,
  normalizeCacheEntry,
  getConfig,
  isValidCacheEntry,
} from "./helpers.js"
import * as logger from "./logger.js"

export function buildCache() {
  const cliArgs = getArgs()
  const paopuConfig = getConfig(cliArgs.config || cliArgs.c)
  const SHA256 = new Hashes.SHA256()
  const getSHA = (data) => SHA256.b64(data)
  const newCache = {}

  for (let packageName in paopuConfig) {
    const packageConfig = paopuConfig[packageName]

    if (!isValidCacheEntry(packageName, packageConfig)) {
      continue
    }

    const normalizedCache = normalizeCacheEntry(packageConfig)

    newCache[packageName] = normalizedCache

    const root = normalizedCache.module
      ? `node_modules/${normalizedCache.resourceBasePath}`
      : normalizedCache.resourceBasePath

    // Update version

    const pkgJson = `${root}/package.json`
    if (!exists(pkgJson)) {
      logger.err(
        `Package '${packageName}' has unresolvable package.json, skipping`
      )
      continue
    }

    const nextVersion = getJSON(getFileContent(pkgJson)).version

    if (nextVersion !== newCache[packageName].version) {
      newCache[packageName].version = nextVersion
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

      newCache[packageName].resources[resource] = computedSRI
    }
  }

  return newCache
}
