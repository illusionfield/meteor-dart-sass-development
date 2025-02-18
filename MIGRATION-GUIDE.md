# Meteor SCSS Migration Guide

The latest version of the fourseven:scss package includes significant changes compared to the previous node-sass implementation. It now uses Dart Sass for compilation, which is modern, faster, and officially supported by the Sass community. This guide provides a step-by-step process to help developers transition smoothly to the new version.

## Why is this change happening?

- The Node.js-based `node-sass` relies on the outdated **LibSass** compiler, which is no longer maintained.
- Dart Sass is the official Sass implementation that supports the latest standards and features.
- Meteor 3 compatibility requires modern packages.
- This transition ensures **better compatibility and long-term maintainability**.

## Migration Steps

### Update the `fourseven:scss` package

To use the latest version, update the package to the newest release:

```sh
meteor update fourseven:scss
```

This automatically switches to the Dart Sass-based compiler.

**Important:** The minimum required Meteor version is 2.10, and the package fully supports Meteor 3.

### 🚨 Critical: Remove Seba Minifiers and Use Standard Minifier CSS 🚨

The `fourseven:scss` package **no longer uses `seba:minifiers-autoprefixer`**.
Instead, it relies on **`standard-minifier-css`**, which includes built-in **autoprefixer** support.

Failure to remove `seba:minifiers-autoprefixer` may lead to errors or incorrect CSS processing by the Meteor build system!

```sh
meteor remove seba:minifiers-autoprefixer
meteor add standard-minifier-css
meteor npm install --save-dev autoprefixer postcss postcss-load-config
```

Learn more about [standard-minifier-css](https://docs.meteor.com/packages/standard-minifier-css.html).

## Check Imports

Dart Sass does not support the `@import` directive. Replace it with `@use` and `@forward`.

### Old `@import` Syntax

```scss
@import "variables";
@import "mixins";
```

### New Dart Sass Syntax

```scss
@use "variables";
@use "mixins";
```

To make imported files globally available, use **`@forward`** instead of `@use`.

### Comparison: `@import` vs. `@use`

| Legacy `@import`                      | Modern `@use`                    |
| ------------------------------------- | -------------------------------- |
| `@import "file";`                     | `@use "file";`                   |
| `@import "file";` (global namespace)  | `@use "file" as *;`              |
| `@import "file";` (to forward styles) | `@forward "file";`               |

For details, see the [Sass Documentation](https://sass-lang.com/documentation/at-rules/import).

**Note:** Throughout the rest of this document, we will refer to `@use` and `@forward` instead of `@import`, as `@import` is no longer supported in Dart Sass.
For more information, see: [`SASS Lang: @import` is Deprecated](https://sass-lang.com/blog/import-is-deprecated)

### Error: "Undefined variable" (`@use` issue)

Dart Sass requires explicit prefixes for imported variables and mixins.

❌ **Incorrect (`@use` does not expose variables directly):**

```scss
@use "variables";

body {
  background-color: $primary-color; // ❌ Error!
}
```

✅ **Solution (`as *` or adding a prefix):**

```scss
@use "variables" as v;

body {
  background-color: v.$primary-color;
}
```

Or, to expose everything globally:

```scss
@use "variables" as *;
```

## Check File Paths

Previously, the `includePaths` option was necessary for proper resolution of relative imports. With Dart Sass, this is handled natively.

### Importing from Node Modules

Old:

```scss
@import "{}/node_modules/bootstrap/scss/bootstrap";
```

New ([recommended by Dart Sass official documentation](https://sass-lang.com/documentation/js-api/interfaces/fileimporter/)):

```scss
@use "~bootstrap/scss/bootstrap";
```

### Importing from Meteor Packages

**Important:** Importing styles from a different package has changed!

Old:

```scss
@import "{my-package:styles}/main";
```

New:

```scss
@use "meteor:{my-package:styles}/main";
```

The `meteor:` prefix is now required due to the Dart Sass importer strategy.

### Index Files

If `@use` or `@forward` targets a directory, Dart Sass searches for one of the following files:

- `index.scss`
- `_index.scss`
- `index.sass`
- `_index.sass`

Example:

```scss
// Loads "index.scss" or "_index.scss" if found in the "styles" directory.
@use "styles";
```

For more details, see [Sass Documentation on Index Files](https://sass-lang.com/documentation/at-rules/import/#index-files).

## Additional Changes

### Indented Syntax Support

Previously, due to a limitation in LibSass, indented syntax (`.sass`) files could only import at the top level. This limitation has been removed in Dart Sass, allowing imports at any level.

### Configuration File Update

The configuration file has been renamed from `scss-config.json` to `.scss.config.json` to support a wider range of Dart Sass-specific settings.

### Debug Mode for Development and Troubleshooting

Debug mode can now be enabled by setting the following environment variable:

```sh
export DEBUG_PACKAGE_SASS=true
```

This provides more detailed error logs for easier troubleshooting.

## Summary

| **Change**             | **Old (`node-sass`)**                   | **New (`Dart Sass`)**                    |
| ---------------------- | --------------------------------------- | ---------------------------------------- |
| Sass Compiler          | `node-sass` (LibSass)                   | `dart-sass`                              |
| Minimum Meteor Version | 1.6+                                    | 2.10+ (Full Meteor 3 support)            |
| Import Syntax          | `@import`                               | `@use` and `@forward`                    |
| Module Import          | `@import "{}/node_modules/module-name"` | `@use "~module-name"`                    |
| Meteor Package Import  | `@import "{package}/styles"`            | `@use "meteor:{package}/styles"`         |
| Variable & Mixin Usage | Direct variable access                  | Prefix required (using `as *` or `as v`) |
| CSS Minification       | `seba:minifiers-autoprefixer`           | `standard-minifier-css`                  |
| Indented Syntax        | No import support                       | Fully supported                          |
| Config File Name       | `scss-config.json`                      | `.scss.config.json`                      |
| Debug Mode             | Not available                           | Enabled via environment variable         |

This guide helps developers transition to the Dart Sass-based `fourseven:scss` package, ensuring compatibility with Meteor 3 and modern Sass features.
