#!/usr/bin/env node

/* eslint-disable no-console */

const tag = "✩ [Paopu]"

export function begin(msg = "") {
  if (!msg) return
  console.info(tag)
  console.info(msg)
}

export function err(msg, type = "error") {
  console[type](msg)
}

export function print(...msg) {
  console.info(...msg)
}

export function finish(msg = "") {
  if (!msg) return
  console.info(msg)
  console.info(tag)
}
