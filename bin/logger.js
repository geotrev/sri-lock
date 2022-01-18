#!/usr/bin/env node

import ora from "ora"

/* eslint-disable no-console */

const tag = "✩ [paopu]"

export function message(info) {
  return tag + " " + info
}

export const reporter = ora().start()
