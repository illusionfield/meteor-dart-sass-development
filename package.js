Package.describe({
  name: 'illusionfield:scss',
  version: '0.5.0',
  summary: 'Dart Sass for Meteor.js',
  git: 'https://github.com/illusionfield/meteor-scss.git',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: 'compileScssBatch',
  use: [
    'caching-compiler',
    'ecmascript',
  ],
  sources: [
    'plugin/compile-scss.js'
  ],
  npmDependencies: {
    '@babel/runtime': "7.24.5",
    'sass-embedded': '1.78.0',
  }
});

Package.onUse(function(api) {
  api.versionsFrom('3.0.2');
  api.use('isobuild:compiler-plugin@1.0.0');
});

Package.onTest(function(api) {
  api.use(['test-helpers', 'tinytest']);
  api.use('illusionfield:scss');

  /*
  // Tests for .scss
  api.addFiles([
    'test/scss/_emptyimport.scss',
    'test/scss/_not-included.scss',
    'test/scss/_top.scss',
    'test/scss/_top3.scss',
    'test/scss/empty.scss',
    'test/scss/dir/_in-dir.scss',
    'test/scss/dir/_in-dir2.scss',
    'test/scss/dir/root.scss',
    'test/scss/dir/subdir/_in-subdir.scss',
  ]);

  api.addFiles('test/scss/top2.scss', 'client', { isImport: true });

  // Test for includePaths
  api.addFiles(['test/include-paths/include-paths.scss', 'test/include-paths/modules/module/_module.scss']);
  */

  api.mainModule('test/index.js', 'client');
});
