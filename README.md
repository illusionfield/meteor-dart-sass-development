# Dart Sass for Meteor.js

This is a build plugin for Meteor.js that compiles Sass files using Dart Sass Embedded.

## Installation

Install the package using Meteor's package management system:

```bash
meteor add illusionfield:scss
```

If you are using this plugin in a Meteor package, add it in the `onUse` block of your package's control file:

```javascript
Package.onUse(function (api) {
  ...
  api.use('illusionfield:scss');
  ...
});
```

## Compatibility

- This plugin is tested with Meteor 3.0 and later versions.
- It uses the [Dart Sass Embedded](https://www.npmjs.com/package/sass-embedded) npm package, meaning it only works on systems supported by Dart Sass: Windows, Mac OS, and Linux.

## Usage

After installation, this package automatically finds all `.scss` and `.sass` files in your project, compiles them with [Dart Sass Embedded](https://www.npmjs.com/package/sass-embedded), and includes the resulting CSS in the application's client bundle. These files can be located anywhere in your project.

### File Types

There are two main types of Sass files handled by this package:

- **Sass source files**: These are the `*.scss` and `*.sass` files that are not imports.
- **Sass imports/partials**: These are files prefixed with an underscore (`_`) or explicitly marked as `isImport: true` in the package's `package.js` file, like this:

```javascript
api.addFiles('x.scss', 'client', { isImport: true });
```

Each compiled source file generates a separate CSS file, which is then merged into one by the `standard-minifiers` package.

### Importing

You can import styles from various locations, including other packages, your own app, and npm modules.

- **Importing from another package**:

```scss
@import "meteor:{my-package:pretty-buttons}/buttons/_styles.scss";

.my-button {
  @extend .pretty-button; // Use styles imported from the package
}
```

- **Importing from your app**:

```scss
@import "{}/client/styles/imports/colors.scss";

.my-nav {
  background-color: @primary-branding-color; // Use a color from the app's style palette
}
```

- **Importing from npm modules**:

```scss
@import "~module-name/stylesheet";
```

If the target is a directory, it will search for an `index.scss`, `_index.scss`, `index.sass`, or `_index.sass` file inside that directory.

### Global Include Path

At the moment, there is no support for a global include path. If there is significant demand, this feature could be added in future updates.

### Source Maps

Source maps are enabled by default, helping with debugging by mapping the compiled CSS back to the original Sass files.

### Autoprefixer

To use Autoprefixer, follow the official [PostCSS with Meteor](https://docs.meteor.com/packages/standard-minifier-css.html#standard-minifier-css) documentation.

## Custom Configuration

You can customize the behavior of the Sass compiler by creating a `.scss.config.json` or `scss-config.json` file in the root of your project. This file supports options like `quietDeps`, `verbose`, and others that control Sass compilation behavior.

Example configuration:

```json
{
  "quietDeps": true,
  "verbose": false
}
```

## Additional Features

- **Caching**: The plugin utilizes a caching system to speed up the compilation of Sass files. The default cache size is set to 10 MB.
- **Import Handling**: When importing Sass files, it attempts to resolve various file extensions (`.scss`, `.sass`, `.css`) and also supports imports from `node_modules` using the `~` syntax.
- **Partial File Recognition**: Files with an underscore (`_`) prefix are treated as partials and are not compiled into standalone CSS files unless explicitly requested.

### Debug Mode

You can enable debug mode by setting the `DEBUG_PACKAGE_SASS` environment variable to any value other than `false` or `0`. In debug mode, additional error messages and stack traces will be logged to the console.

```bash
export DEBUG_PACKAGE_SASS=true
```

This can be helpful for troubleshooting issues during compilation.

## Limitations

- Currently, this plugin only supports platforms compatible with Dart Sass (Windows, Mac OS, Linux).
- There is no global include path setting, though this may be added in the future if requested.
