#!/usr/bin/env node

import path from "path"
import fs from "fs"
import { reporter, message } from "./logger.js"

const CONFIG_FILE_NAME = "paopu.config.json"
const FILE_FORMAT = "utf-8"

export const CACHE_FILE_NAME = ".paopu-cache"

export function getFileContent(target) {
  const targetPath = path.resolve(process.cwd(), target)
  return fs.readFileSync(targetPath, FILE_FORMAT)
}

export function getJSON(target) {
  return JSON.parse(target)
}

export function writeFileContent(target, content) {
  return fs.writeFileSync(
    path.resolve(process.cwd(), target),
    content,
    FILE_FORMAT
  )
}

export function exists(target) {
  return fs.existsSync(path.resolve(process.cwd(), target)) !== false
}

export function isValidCacheEntry(name, packageConfig = {}) {
  const { resources, targets, module, resourceBasePath } = packageConfig
  let isValid = true

  if (module && resourceBasePath) {
    reporter.warn(
      message(
        `Config for '${name}' is a module, so 'resourceBasePath' will be ignored`
      )
    )
  }

  if (!Array.isArray(resources) || !resources.length) {
    reporter.warn(
      message(
        `Config for '${name}' must use the format 'resources: [<string>, <string>, ...]', skipping`
      )
    )
    isValid = false
  }

  if (!Array.isArray(targets) || !targets.length) {
    reporter.warn(
      message(
        `Config for '${name}' must use the format 'targets: [<string>, <string>, ...]', skipping`
      )
    )
    isValid = false
  }

  return isValid
}

export function normalizeCacheEntry(config) {
  return {
    ...config,
    resourceBasePath: config.resourceBasePath || ".",
    resources: {},
    targets: config.targets.map(
      (target) => `${config.targetBasePath || "."}/${target}`
    ),
    module: typeof config.module === "boolean" ? config.module : false,
    urlPattern: config.urlPattern || "cdn.jsdelivr.net",
  }
}

export function getConfig(customConfig) {
  let RESOLVED_CONFIG_NAME = customConfig || CONFIG_FILE_NAME

  if (!exists(RESOLVED_CONFIG_NAME)) {
    reporter.fail(
      message(`Couldn't resolve config file: ${RESOLVED_CONFIG_NAME}, exiting`)
    )
    process.exit()
  }

  return getJSON(getFileContent(RESOLVED_CONFIG_NAME))
}

export function getCache() {
  if (exists(CACHE_FILE_NAME)) {
    return getFileContent(CACHE_FILE_NAME)
  }

  return {}
}

export function clearCache() {
  if (exists(CACHE_FILE_NAME)) {
    fs.unlinkSync(path.resolve(process.cwd(), CACHE_FILE_NAME))
  }
}
