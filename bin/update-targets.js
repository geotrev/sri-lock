#!/usr/bin/env node

import * as logger from "./logger.js"
import {
  getFileContent,
  writeFileContent,
  exists,
  getCache,
  getJSON,
} from "./helpers.js"

const Patterns = {
  SCRIPT: /<script[\s\S]+?<\/script>/g,
  VERSION: /@\d+\.\d+\.\d+(-(alpha|beta|rc)\.\d+)?\//g,
  SRI: /sha256-([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}|[A-Za-z0-9+/]{2})=/g,
}
const paopuCache = getJSON(getCache())

const targeted = Object.keys(paopuCache)
logger.begin("Updating CDN tags:", targeted)

// Update targets

for (let name in targeted) {
  const pkg = paopuCache[name]
  pkg.targets.forEach((target) => {
    if (!exists(target)) {
      logger.print(`Package '${name}' has unresolvable target: '${target}'`)
      return
    }

    const fileContent = getFileContent(target)
    const fileScriptTags = fileContent.match(Patterns.SCRIPT)
    // .filter((tag) => tag.includes("jsdelivr") || tag.includes("unpkg"))

    console.log(fileScriptTags)

    const nextScriptTags = fileScriptTags.map((tag) => {
      const isMin = tag.includes(".min.js")
      const oldHash = tag.match(Patterns.SRI)[0]
      const nextHash = pkg.resources[target]
      const oldVersion = tag.match(Patterns.VERSION)[0]

      const possiblePeer = Object.keys(peers).filter((peerName) =>
        tag.includes(peerName)
      )
      const peerName = possiblePeer.length ? possiblePeer[0] : null

      // If known peers were encountered, update them

      if (peerName) {
        const peer = peers[peerName]
        return tag
          .replace(Patterns.SRI, isMin ? peer.sri.bundleMin : peer.sri.bundle)
          .replace(Patterns.VERSION, `@${peer.version}/`)
      }

      // Otherwise, update the element CDN

      let updaters = []

      if (![pkg.sri.bundleMin, pkg.sri.bundle].includes(oldHash)) {
        updaters.push((tagString) => tagString.replace(oldHash, nextHash))
      }

      if (pkg.version !== oldVersion) {
        updaters.push((tagString) =>
          tagString.replace(oldVersion, `@${pkg.version}/`)
        )
      }

      return updaters.reduce(
        (updatedTag, updater) => (updatedTag = updater(updatedTag)),
        tag
      )
    })

    let nextFileContent = fileContent
    fileScriptTags.forEach((oldTag, i) => {
      if (nextScriptTags[i] === oldTag) return
      nextFileContent = nextFileContent.replace(oldTag, nextScriptTags[i])
    })

    writeFileContent(pkg.root, target, nextFileContent)
  })
}

// packages.forEach((pkg) => {
//   logger.step(`\nUpdating package files for: ${pkg.name}`)

//   Object.keys(pkg.targets).forEach((fileKey) => {
//     const fileTarget = Files[fileKey]
//     const filePath = `${pkg.root}/${fileTarget}`

//     if (fs.existsSync(filePath) !== false) {
//       logger.step(`--> Updating ${filePath}`)

//       const fileContent = getFileContent(pkg.root, fileTarget)
//       const fileScriptTags = fileContent
//         .match(Patterns.SCRIPT)
//         .filter((tag) => tag.includes("cdn.jsdelivr.net"))

//       const nextScriptTags = fileScriptTags.map((tag) => {
//         const isMin = tag.includes(".min.js")
//         const oldHash = tag.match(Patterns.SRI)[0]
//         const nextHash = isMin ? pkg.sri.bundleMin : pkg.sri.bundle
//         const oldVersion = tag.match(Patterns.VERSION)[0]
//         const possiblePeer = Object.keys(peers).filter((peerName) =>
//           tag.includes(peerName)
//         )
//         const peerName = possiblePeer.length ? possiblePeer[0] : null

//         // If known peers were encountered, update them

//         if (peerName) {
//           const peer = peers[peerName]
//           return tag
//             .replace(Patterns.SRI, isMin ? peer.sri.bundleMin : peer.sri.bundle)
//             .replace(Patterns.VERSION, `@${peer.version}/`)
//         }

//         // Otherwise, update the element CDN

//         let updaters = []

//         if (![pkg.sri.bundleMin, pkg.sri.bundle].includes(oldHash)) {
//           updaters.push((tagString) => tagString.replace(oldHash, nextHash))
//         }

//         if (pkg.version !== oldVersion) {
//           updaters.push((tagString) =>
//             tagString.replace(oldVersion, `@${pkg.version}/`)
//           )
//         }

//         return updaters.reduce(
//           (updatedTag, updater) => (updatedTag = updater(updatedTag)),
//           tag
//         )
//       })

//       let nextFileContent = fileContent
//       fileScriptTags.forEach((oldTag, i) => {
//         if (nextScriptTags[i] === oldTag) return
//         nextFileContent = nextFileContent.replace(oldTag, nextScriptTags[i])
//       })

//       writeFileContent(pkg.root, fileTarget, nextFileContent)
//     } else {
//       logger.step(`--> File not found: ${filePath}. Skipping.`)
//     }
//   }) // end Object.keys
// }) // end packages.forEach

logger.finish("CDN tags updated ✨")
