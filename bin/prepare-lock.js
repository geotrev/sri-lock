import path from "path"
import Hashes from "jshashes"
import { getJSON, writeFileContent, getFileContent, exists } from "./helpers.js"
import { canUpdate } from "./can-update.js"
import * as logger from "./logger.js"

let args = process.argv
let configFile = "paopu.config.json"

args.forEach((arg) => {
  const getVal = (parts) => parts[parts.length - 1]
  if (arg.startsWith("--config=") || arg.startsWith("-c=")) {
    config = getVal(arg.split("="))
  }
})

logger.begin("Building Metadata")

const metadata = getJSON(configFile)
const SHA256 = new Hashes.SHA256()
const getSHA = (data) => SHA256.b64(data)
const nextDataState = {}

for (let name in metadata) {
  const {
    path: rootPath,
    version: prevVersion,
    resources: prevResources,
    module = false,
  } = metadata[name]

  const root = module ? "node_modules/" + name : rootPath

  logger.step(`Updating resource SRIs: ${name}`)

  // If we can't update, return the existing data and move on
  if (!canUpdate(name, rootPath, module, prevResources)) {
    nextDataState[name] = metadata[name]
    continue
  }

  // Update version

  const pkgVersion = getJSON(`${root}/package.json`).version
  let version = prevVersion

  if (pkgVersion !== version) {
    version = pkgVersion
    logger.print(`--> Version changed, updated.`)
    logger.print(`    ${pkgVersion}`)
  } else {
    logger.print("--> Version unchanged, skipping.")
  }

  // Update SRI hashes

  const resources = prevResources
  const length = resources.length
  let index = -1

  while (++index < length) {
    const resource = resources[index]

    if (!resource.file) {
      logger.print(
        `--> Encountered missing 'file' for resource, skipping.`,
        "error"
      )
      continue
    }

    if (!resource.sri) {
      logger.print(`--> Generating SRI for resource: ${resource.file}`)
    }

    const filePath = path.resolve(process.cwd(), root, resource.file)

    if (!exists(filePath)) {
      logger.print(
        `CDN resource ${name} has an unresolvable file resource, skipping:`
      )
      logger.print(`    ${filePath}`)
      continue
    }

    const fileContent = getFileContent(filePath)
    const computedSRI = `sha256-${getSHA(fileContent)}`

    if (computedSRI !== resource.sri) {
      resource.sri = computedSRI
      logger.print(`--> SRI for '${resource.file}' changed, updated.`)
      logger.print(`    sri: ${computedSRI}`)
    } else {
      resources[index]
      logger.print(`--> SRI for ${resource.file} unchanged, skipping.`)
    }
  }

  nextDataState[name] = { ...metadata[name], version, resources }
}

const payload = JSON.stringify(nextDataState, null, 2)
writeFileContent(configFile, payload)
logger.finish()
