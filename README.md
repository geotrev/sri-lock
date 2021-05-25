# ✩ Paopu ✩

A CLI tool to manage your CDN script tags in files. Automatically generate a sub-resource integrity from a file, then add it to the matching script tag.

Read the [Why](#why) section for more details.

Paopu was created to work with Node 14.

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
  src="https://cdn.jsdelivr.net/npm/my-package@0.3.2/dist/my-cool-package.min.js"
  integrity="sha256-waCWKicYMCJic4tBKdkV54qhuGsq8J9JWQY+QmFVjj8="
  crossorigin="anonymous"
></script>
```

**Problem:** Every time you release a new package version, you need to update that integrity hash. Sometimes in multiple files.

**Solution:** Install Paopu, add a config, then run the CLI tool. Done. ✨

## Create a config

Create a `paopu.config.json` at the root of your project. Optional properties below have default values displayed.

```
// paopu.config.json
{
  // Each entry uses a package name as the key
  "package-name": {
    // Specifies file resources used in your script tags. These paths should
    // partially match your path in the `src` attribute.
    //
    // REQUIRED
    "resources": ["some/path/bundle-name.min.js", "some-path/bundle-name.js"],

    // Specifies which files have the script tags.
    //
    // REQUIRED
    "targets": ["README.md", "test/index.html"],

    // Specifies if the resources are located in a modules folder.
    // Automatically prepends `node_modules/package-name` to paths
    // defined in `resources`, where `package-name` is the key
    // of your paopu config object.
    // This also causes the tool to ignore `resourceBasePath`
    //
    // OPTIONAL
    "module": false,

    // Specifies a common base path for paths in `resources`
    // Should resolve to a package root in all cases.
    // This is ignored if `module` is `true`.
    //
    // OPTIONAL
    "resourceBasePath": undefined,

    // Specifies a common base path for paths in `targets`
    //
    // OPTIONAL
    "targetBasePath": undefined,

    // A pattern used to resolve which script tags to update.
    // E.g., 'unpkg.com'
    //
    // OPTIONAL
    "urlPattern": 'cdn.jsdelivr.net'
  }
}
```

## CLI options

Any CLI options given will override the defaults used by the tool.

### Custom config

Flags: `--config`, `-c`

Default: `paopu.config.json`

Example usage: `paopu -c path/to/paopu.config.json`

Override the default configuration filename.

### Debug mode

Flags: `--debug`, `-d`

Default: `false`

Example usage: `paopu -d`

If given, Paopu will spit out a `.paopu-cache` file so you can inspect the resolved paths, options, etc., being used by the tool.
