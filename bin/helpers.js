#!/usr/bin/env node

import path from "path"
import fs from "fs"
import * as logger from "./logger.js"

export const CONFIG_FILE_NAME = "paopu.config.json"
export const CACHE_FILE_NAME = ".paopu-cache"
export const FILE_FORMAT = "utf-8"

export const getFileContent = (target) => {
  const targetPath = path.resolve(process.cwd(), target)
  return fs.readFileSync(targetPath, FILE_FORMAT)
}

export const getJSON = (target) => JSON.parse(getFileContent(target))

export const writeFileContent = (target, content) => {
  return fs.writeFileSync(
    path.resolve(process.cwd(), target),
    content,
    FILE_FORMAT
  )
}

export const exists = (target) =>
  fs.existsSync(path.resolve(process.cwd(), target)) !== false

export const canUpdate = (name, rootPath, module, resources) => {
  let canUpdate = true

  /* eslint-disable no-console */
  if (!rootPath && !module) {
    logger.err(
      `Package '${name}' must have one of 'module' or 'path' options, skipping.`
    )
    canUpdate = false
  }

  if (rootPath && module) {
    logger.err(
      `Package '${name}' can only have one of 'module' or 'path' options, skipping.`
    )
    canUpdate = false
  }

  if (!Array.isArray(resources) || !resources.length) {
    canUpdate = false
  }
  /* eslint-enable no-console */

  return canUpdate
}

export const getCache = () => {
  if (exists(CACHE_FILE_NAME)) {
    return getJSON(CACHE_FILE_NAME)
  }

  return {}
}
