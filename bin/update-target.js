#!/usr/bin/env node

import * as logger from "./logger.js"
import { getFileContent, writeFileContent, exists } from "./helpers.js"

const Patterns = {
  SCRIPT: /<script[\s\S]+?<\/script>/g,
  VERSION: /@\d+\.\d+\.\d+(-(alpha|beta|rc)\.\d+)?\//g,
  SRI: /sha256-([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}|[A-Za-z0-9+/]{2})=/g,
}

export function writeToTarget(target, name, packageConfig) {
  if (!exists(target)) {
    logger.print(`Package '${name}' has unresolvable target: '${target}'`)
    return
  }

  const fileContent = getFileContent(target)
  const detectedTags = fileContent.match(Patterns.SCRIPT)

  /**
   * See if any detectedTags contain the urlPattern and at least
   * one resource
   */
  const resourceNames = Object.keys(packageConfig.resources)
  const detectedScriptTags = detectedTags.filter(
    (tag) =>
      tag.indexOf(packageConfig.urlPattern) > -1 &&
      resourceNames.some((resource) => tag.indexOf(resource) > -1)
  )

  if (!detectedScriptTags.length) return

  const nextScriptTags = detectedScriptTags.map((tag) => {
    const targetResource = resourceNames.filter((name) => tag.includes(name))[0]
    const newHash = packageConfig.resources[targetResource]
    const hashMatches = tag.match(Patterns.SRI)
    const oldHash = hashMatches[0]
    const oldVersion = tag.match(Patterns.VERSION)
    const newVersion = `@${packageConfig.version}/`

    const updaters = []

    if (oldHash !== newHash) {
      updaters.push((tagString) => tagString.replace(Patterns.SRI, newHash))
    }

    if (oldVersion !== newVersion) {
      updaters.push((tagString) =>
        tagString.replace(Patterns.VERSION, newVersion)
      )
    }

    return updaters.reduce(
      (updatedTag, updater) => (updatedTag = updater(updatedTag)),
      tag
    )
  })

  let nextFileContent = fileContent
  detectedScriptTags.forEach((oldTag, i) => {
    if (nextScriptTags[i] === oldTag) return
    nextFileContent = nextFileContent.replace(oldTag, nextScriptTags[i])
  })

  writeFileContent(target, nextFileContent)
}
