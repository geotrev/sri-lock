#!/usr/bin/env node

import yargs from "yargs"
import { hideBin } from "yargs/helpers"

export function getArgs() {
  return yargs(hideBin(process.argv))
    .command("c <config>", "Change the default config file name")
    .demandCommand(0).argv
}
