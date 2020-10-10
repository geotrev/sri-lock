import path from "path"
import Hashes from "jshashes"
import {
  getJSON,
  writeFileContent,
  getFileContent,
  exists,
  getCache,
  canUpdate,
  CACHE_FILE_NAME,
  CONFIG_FILE_NAME,
} from "./helpers.js"
import * as logger from "./logger.js"

let args = process.argv
let RESOLVED_CONFIG_NAME = CONFIG_FILE_NAME

if (args) {
  args.forEach((arg) => {
    const getVal = (parts) => parts[parts.length - 1]
    if (arg.startsWith("--config=") || arg.startsWith("-c=")) {
      RESOLVED_CONFIG_NAME = getVal(arg.split("="))
    }
  })
}

logger.begin("Rebuilding cache...")

if (!exists(RESOLVED_CONFIG_NAME)) {
  logger.finish(
    `Couldn't resolve config file: ${RESOLVED_CONFIG_NAME}, exiting.`
  )
  process.exit()
}

const paopuConfig = getJSON(RESOLVED_CONFIG_NAME)
const detectedCache = getCache()
const SHA256 = new Hashes.SHA256()
const getSHA = (data) => SHA256.b64(data)
const nextCache = {}

for (let name in paopuConfig) {
  const { resources, path: resourceRoot, module = false } = paopuConfig[name]
  nextCache[name] = detectedCache[name] || {}

  const root = module ? "node_modules/" + name : resourceRoot

  // If we can't update, return the existing data and move on
  if (!canUpdate(resourceRoot, module, resources)) {
    continue
  }

  // Update version

  const pkgPath = `${root}/package.json`
  if (!exists(pkgPath)) {
    logger.print(`Package '${name}' has unresolvable package.json, skipping.`)
    continue
  }

  const pkgVersion = getJSON(pkgPath).version

  if (pkgVersion !== nextCache[name].version) {
    nextCache[name].version = pkgVersion
  }

  // Update SRI hashes

  const length = resources.length
  let index = -1

  while (++index < length) {
    const resource = resources[index]
    const resourcePath = path.resolve(process.cwd(), root, resource)

    if (!exists(resourcePath)) {
      logger.print(`Resource '${resource}' is unresolvable, skipping.`)
      logger.print(`- Tried path: ${resourcePath}`)
      continue
    }

    const resourceContent = getFileContent(resourcePath)
    const computedSRI = `sha256-${getSHA(resourceContent)}`
    nextCache[name][resource] = computedSRI

    if (computedSRI !== nextCache[name][resource]) {
      nextCache[name][resource.file] = computedSRI
    }
  }
}

if (detectedCache !== nextCache) {
  writeFileContent(CACHE_FILE_NAME, JSON.stringify(nextCache))
}

logger.finish(`Cache saved to '${process.cwd()}/.paopu-cache'`)
