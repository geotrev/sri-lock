import path from "path"
import { nodeResolve } from "@rollup/plugin-node-resolve"

const input = path.resolve(__dirname, "src/index.js")

const plugins = [nodeResolve()]

const output = {
  format: "es",
  name: "cdns",
  sourcemap: true,
  file: path.resolve(__dirname, `lib/cdns.js`),
}

export default { input, plugins, output }
