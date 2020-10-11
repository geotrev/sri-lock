# Paopu

A CLI tool to manage your CDN script tags in files. Tell it which files to update, which to generate hashes from, then let Paopu handle the rest.

Read the [Why](#why) section for more details.

Paopu currently only works with Node 14, but will support 10+ in the future.

Feel free to submit an issue or pull request. :)

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

Paopu creates a `.paopu-cache` file to track version numbers and sub-resource integrity hashes for packages defined in your config. You can add this file to your `.gitignore` if you prefer not to track it; the utility works either way.

## Why?

**Scenario:** Let's say you want to tell the world that your npm package's bundle can be accessed on CDN (any cdn will work). You might include an example script in your README, like so:

```html
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/my-cool-package@0.3.2/dist/bundle.min.js"
  integrity="sha256-waCWKicYMCJic4tBKdkV54qhuGsq8J9JWQY+QmFVjj8="
  crossorigin="anonymous"
></script>
```

Maybe you also include this in an HTML file in your repository so you can easily test that the integrity is correct and your resource is secure. Neat.

**Problem:** You release a new version and need to update the script tag. You need to do it manually or with some janky node script though, obviously.

Not only that, you have the tags in multiple files. Maybe you can get away with copy/pasting.

Kind of annoying, right?

**Solution:** Install Paopu, add a config, then run the CLI tool. Done. 💪✨

## Create a config

First, create the file:

```sh
$ touch paopu.config.json
```

Then add some data that describes your CDN resources. Each top level key should be an _npm package name_ of your resource (or otherwise have a `package.json` in its [folder root](#resourcebasepath)). The value is an object with identifying information about the CDN script tag(s).

Using the example in the [Why?](#why) section, let's create a simple configuration describing it:

```json
{
  "my-cool-package": {
    "resources": ["dist/bundle.min.js", "dist/bundle.js"],
    "targets": ["README.md", "test/index.html"]
  }
}
```

The basic configuration will have `resources` and `targets` keys. Each is an array of the resource file path (under `node_modules` by default) and the files containing the script tags you want to change, respectively.

### Monorepos

If you're working in a monorepo, you probably don't want to look in `node_modules`. Luckily there's an option to deal with that. Let's create it:

```json
{
  "package-1": {
    "module": false,
    "resoureBasePath": "packages/package-1",
    "resources": ["dist/bundle.min.js", "dist/bundle.js"],
    "targets": ["README.md", "test/index.html"]
  },
  "package-2": {
    "module": false,
    "resoureBasePath": "packages/package-2",
    "resources": ["dist/bundle.min.js", "dist/bundle.js"],
    "targets": ["README.md", "test/index.html"]
  },
  "my-cool-package": {
    "resources": ["dist/bundle.min.js", "dist/bundle.js"],
    "targets": ["packages/package-1/README.md", "packages/package-1/test/index.html"]
    "urlPattern": "unpkg.com"
  }
}
```

A bit dicier, let's break it down:

- Both `package-1` and `package-2` are flagged as non-modules, and given custom folder paths under `packages/*`.
- `my-cool-package` is still used, but it's only under `packages/package-1`. In this case, we're probably using `my-cool-package` as a peer dependency to `package-1` and want to keep that up to date as necessary.

### Config options

#### `resources`

Type: `Array.<string>` | **required**

An array of file paths. Each will have a SHA derived from it.

#### `targets`

Type: `Array.<string>` | **required**

An array of file paths, each being a target with a `<script>` tag to be updated.

#### `resourceBasePath`

Type: `string` | default: `undefined`

**`module` must be false** to use this option.

The base directory to be used when finding a non-module resource.

#### `module`

Type: `boolean` | default: `true`

Specifies if the resource is located in `node_modules`. Set this to `false` and provide a [`resourceBasePath`](#resourceBasePath) to change the default resource path.

### `urlPattern`

Type: `string` | default: `cdn.jsdelivr.net`

A pattern to be used when checking script tags in your files. Paopu will only update tags with `src` attributes containing the pattern.

## CLI options

Any CLI options given will override the defaults used by the tool.

### Custom config

Flags: `--config`, `-c`

Example usage: `paopu -c my-custom-file.json`

Override the default configuration filename.

## TL;DR what does this tool do, exactly?

1. Paopu first reads your configuration file, then generates a temporary cache. The cache stores resource version numbers, SRI hashes, and normalized values derived from your config.
2. Using the cache, Paopu searches and updates the files you defined in `targets`, updating only script tags using a CDN pattern and one of the paths you defined in `resources`.

## TODO

- Add more hashing options via config and cli: `128`, `384`, `512`?
