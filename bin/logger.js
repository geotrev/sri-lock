/* eslint-disable no-console */

const tag = "[cdns]: "

export function begin(msg) {
  console.log(tag, `==> ${msg}`)
}

export function print(msg, type = "info") {
  console[type](tag, msg)
}

export function step(msg, nextLineBlank) {
  console.log(tag)
  console.log(tag, msg)
  if (nextLineBlank) console.log(tag)
}

export function finish() {
  console.log(tag)
  console.log(`${tag} Done ✨\n`)
}
