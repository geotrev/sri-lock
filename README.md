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
  src="https://cdn.jsdelivr.net/npm/my-package@0.3.2/dist/my-cool-package.min.js"
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
    // Automatically prepends `node_modules/package-name` to your
    // paths defined in `resources`
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

Example usage: `paopu -c my-custom-file.json`

Override the default configuration filename.

### Debug mode

Flags: `--debug`, `-d`

Default: `false`

Example usage: `paopu -d`

If given, Paopu will spit out a `.paopu-cache` file so you can inspect the resolved paths, options, etc., being used by the tool.
