# ✩ Paopu ✩

A CLI tool to manage your CDN script tags in files. Tell it which files to update, which to generate SRI hashes from, then let Paopu handle the rest.

Read the [Why](#why) section for more details.

Paopu currently only works with Node 14, but will support 10+ in the future.

Feel free to submit an issue or pull request. :)

**TODO:**

- More hashing options (currently only `SHA256` is supported).

## Install & Run

1. Install it in your project:

```sh
$ npm i -D paopu
```

2. [Create a configuration.](#create-a-config)
3. Run it:

```sh
$ paopu
```

## Why?

**Scenario:** Let's say you want to tell the world that your package's bundle can be accessed on a public CDN. You might include an example script in your README, like so:

```html
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/my-cool-package@0.3.2/dist/my-cool-package.min.js"
  integrity="sha256-waCWKicYMCJic4tBKdkV54qhuGsq8J9JWQY+QmFVjj8="
  crossorigin="anonymous"
></script>
```

Maybe you also include this in an HTML file in your repository so you can easily test that the integrity is correct and your resource is secure. Neat.

**Problem:** You release a new version and need to update the script tag. You need to do it manually or with some janky node script, obviously.

Not only that, you have the tags in multiple files. Maybe you can get away with copy/pasting.

Kind of annoying, right?

**Solution:** Install Paopu, add a config, then run the CLI tool. Done. 💪

## Create a config

Create a `paopu.config.json` at the root of your project. Then create a simple configuration describing your package. We'll use the example from above:

```json
{
  "my-cool-package": {
    "resources": ["dist/my-cool-package.min.js", "dist/my-cool-package.js"],
    "targets": ["README.md", "test/index.html"]
  }
}
```

Some things of note:

- The key of the config entry is your package name
- By default, the root of your project is the base path when resolving files.
- Each `resources` item is a path leading to a file to be hashed for a sub-resource integrity value.
- Similarly, each `targets` item is a path leading to a file with CDN script tags.
- A `version` will be derived from your project's `package.json`. If your tag's `src` attribute has no version, it isn't used.
- A base64 hash will be derived from each file in `resources`. If your tag doesn't have an `integrity` attribute, nothing happens.

See [CLI options](#cli-options) for customization options.

### Monorepos

You can work with monorepos in two ways.

One way is to add just one config file at the monorepo root, like this:

```json
{
  "package-1": {
    "basePath": "packages/package-1",
    "resources": ["dist/bundle.min.js", "dist/bundle.js"],
    "targets": ["README.md", "test/index.html"]
  },
  "package-2": {
    "basePath": "packages/package-2",
    "resources": ["dist/bundle.min.js", "dist/bundle.js"],
    "targets": ["README.md", "test/index.html"]
  }
}
```

To make the config more readable, `basePath` is used to find the package root, which means you can exclude that portion from paths in `resources` and `targets`.

The second way is to use `paopu` in each package individually, including a config in each package root, similar to the simple configuration from before.

### External modules

Sometimes you need to link to external modules because they are required as dependents/peers. To do this, mark your entry with the `module` option. let's use the previous monorepo example:

```json
{
  "package-1": {
    ...
  },
  "package-2": {
    ...
  },
  "my-node-package": {
    "module": true,
    "basePath": "packages/package-1",
    "resources": ["dist/bundle.min.js", "dist/bundle.js"],
    "targets": [
      "package-1/README.md",
      "package-1/test/index.html"
    ]
  }
}
```

Using the `module` option will do two main things to the above config:

- Prepend `node_modules/my-node-package` to each path in `resources` only
- `basePath` will only apply to paths in `targets`.

## Config options

### `resources`

Type: `Array.<string>` | **required**

An array of file paths. Each will have a SHA derived from it.

### `targets`

Type: `Array.<string>` | **required**

An array of file paths, each possibly containing `<script>` tags to be updated. If there are no script tags, nothing happens.

### `module`

Type: `boolean`

Default: `false`

This treats your resource as a dependent/peer.

For example, given this config entry:

```json
{
  "my-cool-package": {
    "module": true,
    "resources": ["dist/my-cool-package.min.js"]
    "targets": ["README.md"]
  }
}
```

Paopu will modify each path under `resources` to look in `node_modules`. In this case, the finally resource path would be: `node_modules/my-cool-package/dist/my-cool-package.min.js`.

If given, `module` will nullify the application of `basePath` to paths in `resources`.

### `basePath`

Type: `string`

Default: `'.'`

If given, will be prepended to each path in `resources` and `targets`.

If `basePath` is given while `module` is `true`, this option will only apply to `targets`.

### `urlPattern`

Type: `string`

Default: `'cdn.jsdelivr.net'`

A pattern to be used when checking script tags in your files. Paopu will only update tags with `src` attributes containing the pattern.

## CLI options

Any CLI options given will override the defaults used by the tool.

### Custom config

Flags: `--config`, `-c`

Default: `paopu.config.json`

Example usage: `paopu -c my-custom-file.json`

Override the default configuration filename.

### Debug mode

Flags: `--debug`, `-d`

Default: `false`

Example usage: `paopu -d`

If given, Paopu will spit out a `.paopu-cache` file so you can inspect the resolved paths, options, etc., being used by the tool.

## TL;DR what does this tool do, exactly?

1. Paopu first reads your configuration file, then generates a temporary cache. The cache stores resource version numbers, SRI hashes, and normalized values derived from your config.
2. Using the cache, Paopu searches and updates the files you defined in `targets`, updating only script tags matching the given `urlPattern` and with `src` attributes containing a path you defined in `resources`.
