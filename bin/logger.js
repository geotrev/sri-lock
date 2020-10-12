#!/usr/bin/env node

/* eslint-disable no-console */

const tag = "✩ [Paopu]"

export function begin(...msg) {
  if (!msg || !msg.length) return
  console.info(tag, ...msg)
}

export function err(msg, type = "error") {
  console[type](tag, msg)
}

export function print(...msg) {
  console.info(tag, ...msg)
}

export function finish(msg = "") {
  if (!msg) return
  console.info(tag, msg)
}
