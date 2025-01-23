Package.describe({
  name: 'illusionfield:scss',
  version: '0.6.2',
  summary: 'Dart Sass for Meteor.js',
  git: 'https://github.com/illusionfield/meteor-scss.git',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: 'compileScssBatch',
  use: [
    'caching-compiler@2.0.0',
    'ecmascript@0.16.9',
  ],
  npmDependencies: {
    '@babel/runtime': '7.26.0',
    'sass-embedded': '1.83.4',
  },
  sources: [
    'plugin/compile-scss.js',
  ],
});

Package.onUse((api) => {
  api.versionsFrom('3.0');
  api.use('isobuild:compiler-plugin@1.0.0');
});

Package.onTest((api) => {
  api.use(['tinytest', 'test-helpers']);
  api.use('ecmascript');
  api.use('illusionfield:scss');

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

  //api.addFiles('test/scss/top2.scss', 'client', { lazy: true });
  api.addFiles('test/scss/top2.scss', 'client', { isImport: true });

  // Test for includePaths
  //api.addFiles(['test/include-paths/include-paths.scss', 'test/include-paths/modules/module/_module.scss']);

  api.mainModule('scss-tests.js', 'client');
});
