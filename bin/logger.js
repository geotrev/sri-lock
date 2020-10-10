/* eslint-disable no-console */

const tag = "✩ [Paopu]"

export function begin(msg = "") {
  if (!msg) return
  console.log(tag)
  console.log(msg)
}

export function print(msg, type = "info") {
  console[type](msg)
}

export function step(msg) {
  console.log("\n")
  console.log(msg)
}

export function finish(msg = "") {
  if (!msg) return
  console.log(msg)
  console.log(tag)
}
