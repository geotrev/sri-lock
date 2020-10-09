import path from "path"
import resolve from "@rollup/plugin-node-resolve"

const input = path.resolve(__dirname, "src/index.js")

const plugins = [resolve()]

const output = {
  format: "es",
  name: "cdns",
  sourcemap: true,
  file: path.resolve(__dirname, `lib/cdns.js`),
}

export default { input, plugins, output }
