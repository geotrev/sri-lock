# Paopu

A CLI tool to manage your CDN script tags in files. Tell it which files to update, which to generate hashes from, then let Paopu handle the rest.

Read the [Why](#why) section for more details.

Paopu currently only works with Node 14, but will support 10+ in the future.

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
  src="https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js"
  integrity="sha256-waCWKicYMCJic4tBKdkV54qhuGsq8J9JWQY+QmFVjj8="
  crossorigin="anonymous"
></script>
```

Maybe you also include this in an HTML file in your repository so you can easily test that the integrity is correct and your resource is secure. Neat.

**Problem:** You release a new version and need to update the script tag. You need to do it manually or with some janky node script though, obviously.

Not only that, you have the tags in multiple files. Maybe you can get away with copy/pasting.

Kind of annoying, right?

**Solution:** Install Paopu, add a config that describes the above setup, then run the CLI tool. Done. 💪✨

## Create a config

First, create the file:

```sh
$ touch paopu.config.json
```

Then, create a config that describes your CDN resources. The config is JSON, with each top level key being the _npm package name_ of your resource, and an object value describing key metadata needed to update the `script` tag.

Using the example in the [Why?](#why) section, here's what that script tag's configuration would look like:

```json
{
  "my-package": {
    "resources": ["umd/my-package.min.js", "umd/my-package.js"],
    "targets": ["README.md", "test/index.html"]
  }
}
```

This will tell Paopu that each file in `targets` will be searched for a `script` tag, and if those script tags contain `src` attributes matching a [cdn pattern](#urlpattern), then they will be updated using the files specified under `resources`. In the same way, the package's `version` will be derived from the resource's root directory (e.g., `node_modules/*/package.json`).

But wait, there's more. You can also configure a resource to be searched locally, which is useful for monorepos:

```json
{
  "react": {
    "path": "packages/react",
    "version": "16.13.1",
    "resources": ["umd/react.production.min.js", "umd/react.development.js"],
    "targets": ["README.md", "test/index.html"]
  }
}
```

NOTE: The resource isn't using `module: true` anymore, and that's intentional, as you can't have both a module resource that's also defined locally using `path`. Of course, you can always manually add `node_modules` to the path, which is necessary for things like packages installed from monorepos (e.g., `@babel/*`, `@rollup/*`, etc).

Just like before, the `version` is derived from the package's root folder, but this time in the monorepo.

Alright, that's pretty cool. But what about peer dependencies? That is, maybe you're updating your `targets` in `packages/react`, but there are peer CDN script tags that needs to be updated in that directory too. In the case of React, that might be `react-dom`, so let's add that too:

```json
{
  "react": {
    "path": "packages/react",
    "version": "16.13.1",
    "resources": ["umd/react.production.min.js", "umd/react.development.js"],
    "targets": ["README.md", "test/index.html"]
  },
  "react-dom": {
    "path": "packages/react-dom",
    "peer": true,
    "version": "16.13.1",
    "resources": [
      "umd/react-dom.production.min.js",
      "umd/react-dom.development.js"
    ],
    "targets": ["README.md", "test/index.html"]
  }
}
```

Now as Paopu is updating `react`, it will check if any of the scripts in its `targets` files happen to be for `react-dom` and update them.

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

### `--config`

Alias: `-c`

Example usage: `--config=my-custom-file.json`

Override the default configuration filename.

## TL;DR what does this tool do, exactly?

1. Paopu first reads your configuration file, then generates a temporary cache. The cache stores resource version numbers, SRI hashes, and normalized values derived from your config.
2. Using the cache, Paopu searches and updates the files you defined in `targets`, updating only script tags using a CDN pattern and one of the paths you defined in `resources`.

## TODO

- Add more hashing options: `128`, `384`, `512`?
