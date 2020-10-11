import yargs from "yargs"
import { hideBin } from "yargs/helpers"

export const getArgs = () =>
  yargs(hideBin(process.argv))
    .command("c <config>", "Change the default config file name")
    .demandCommand(0).argv
