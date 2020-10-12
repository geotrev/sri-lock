#!/usr/bin/env node

import path from "path"
import fs from "fs"
import * as logger from "./logger.js"

const CONFIG_FILE_NAME = "paopu.config.json"
const FILE_FORMAT = "utf-8"

export const CACHE_FILE_NAME = ".paopu-cache"

export const getFileContent = (target) => {
  const targetPath = path.resolve(process.cwd(), target)
  return fs.readFileSync(targetPath, FILE_FORMAT)
}

export const getJSON = (target) => JSON.parse(target)

export const writeFileContent = (target, content) => {
  return fs.writeFileSync(
    path.resolve(process.cwd(), target),
    content,
    FILE_FORMAT
  )
}

export const exists = (target) =>
  fs.existsSync(path.resolve(process.cwd(), target)) !== false

export const validCacheEntry = (name, packageConfig = {}) => {
  const { resources, targets, resourceBasePath, module = true } = packageConfig
  let isValid = true

  if (typeof resourceBasePath !== "string" && !module) {
    logger.err(
      `Config for '${name}' must have the option 'resourceBasePath: <string>' if 'module: false' is given, skipping`
    )
    isValid = false
  } else if (resourceBasePath && module) {
    logger.err(
      `Config for '${name}' can only have one of 'module: true' or 'resourceBasePath: <string>' options, skipping`
    )
    isValid = false
  }

  if (!Array.isArray(resources) || !resources.length) {
    logger.err(
      `Config for '${name}' must use the format 'resources: [<string>, <string>, ...]', skipping`
    )
    isValid = false
  }

  if (!Array.isArray(targets) || !targets.length) {
    logger.err(
      `Config for '${name}' must use the format 'targets: [<string>, <string>, ...]', skipping`
    )
    isValid = false
  }

  return isValid
}

export const normalizeCacheEntry = (config) => {
  return {
    ...config,
    resources: {},
    module: typeof config.module === "boolean" ? config.module : true,
    urlPattern: config.urlPattern || "cdn.jsdelivr.net",
  }
}

export const getConfig = (customConfig) => {
  let RESOLVED_CONFIG_NAME = customConfig || CONFIG_FILE_NAME

  if (!exists(RESOLVED_CONFIG_NAME)) {
    logger.finish(
      `Couldn't resolve config file: ${RESOLVED_CONFIG_NAME}, exiting`
    )
    process.exit()
  }

  return getJSON(getFileContent(RESOLVED_CONFIG_NAME))
}

export const getCache = () => {
  if (exists(CACHE_FILE_NAME)) {
    return getFileContent(CACHE_FILE_NAME)
  }

  return {}
}
