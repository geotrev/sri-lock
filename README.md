# Paopu

A CLI tool to manage your CDN script tags in files. It automatically handles SHA/SRI hash checking and resource versions for you.

Read the [Why](#why) section for more details.

Paopu currently only works with Node 14, but will support 10+ in the future.

## Install

1. Install it in your project.

```sh
$ npm i -D paopu
```

2. [Create a configuration.](#create-a-config)
3. Run it.

```sh
$ paopu
```

Paopu creates a `.paopu-cache` file to track things like version numbers and sub-resource integrity hashes for packages defined in your paopu config. You can add it to your `.gitignore` if you prefer.

## Why?

**Scenario:** Let's say you want to tell the world that your npm package's bundle can be accessed via `jsdelivr` (any cdn will do, though). You might include an example script in your README, like so:

```html
<!-- Some README or html file -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/react@16.13.1/umd/react.production.min.js"
  integrity="sha256-waCWKicYMCJic4tBKdkV54qhuGsq8J9JWQY+QmFVjj8="
  crossorigin="anonymous"
></script>
```

Maybe you also include this in an html file in your repository so you can easily test that the integrity is correct and your resource is secure, so you add it there too.

**Problem:** You release a new version and need to update the script tag. Shit.

Not only that, you have two of these things in different files. So you manually generate the new SHA256 hash, as well as updating the version in the `src` attribute of the example link tag.

Kind of annoying right?

**Solution:** Install Paopu, add a config that describes the above setup, then run the CLI tool. Done. 💪✨

## Create a config

First, create the file:

```sh
$ touch paopu.config.json
```

Then, create a config that describes your CDN resources. It's a JSON file, with each top level key being the _npm package name_ of your resource, and an object value describing key metadata needed to update the `script` tag.

Using the example in the [Why?](#why) section, here's what that script tag's configuration would look like:

```json
{
  "react": {
    "module": true,
    "version": "16.13.1",
    "resources": ["umd/react.production.min.js", "umd/react.development.js"],
    "targets": ["README.md", "test/index.html"]
  }
}
```

This will tell Paopu that each file in `targets` will be searched for a `script` tags, and if they contain the file names specified under `resources`, they will be updated. In the same way, the package's `version` will be derived from the resource's root directory (e.g., `node_modules/*/package.json`).

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

## Run the bin script

Once your configuration is done, kick off the script.

```sh
$ paopu
```

The command does two main things:

1. Reads your `resources`, then attaches `SHA256` hashes next to them (if they can be retrieved). Additionally, if the `version` key is updated (if out of date).
2. Using your config, Paopu searches and updates your`targets` files. If they don't contain any valid valid script tags, or the tags don't contain a link to the given package, nothing happens.

### Config file options

#### "version"

Type: `string`

The version of the resource. It'll be automatically updated if a new version is detected from the resource's `package.json` folder root.

#### "path"

Type: `string`

The folder path for the base directory of the resource.

#### "module"

Type: `boolean`

Specifies if the resource is located from `node_modules`.

#### "peer"

Type: `boolean`

Specifies if the resource needs to be updated in another resource's target files.

#### "resources"

Type: `Array.<string>`

An array of file paths. Each will have a SHA derived from it.

#### "targets"

Type: `Array.<string>`

An array of file paths, each being a target with a `<script>` tag to be updated.

## TODO

- Add more hashing options: `128`, `384`, `512`?
- CLI flags to override the config?
