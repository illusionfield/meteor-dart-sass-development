Package.describe({
  name:    'illusionfield:scss',
  version: '0.9.0',
  summary: 'Dart Sass for Meteor.js',
  git:     'https://github.com/illusionfield/meteor-scss.git',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: 'compileScssBatch',
  use: [
    'caching-compiler@1.2.2 || 2.0.0',
    'ecmascript@0.16.3 || 0.16.9'
  ],
  sources: ['plugin/compile-scss.js'],
  npmDependencies: {
    '@babel/runtime': '7.26.0',
    'sass': '1.83.4'
  },
});

Package.onUse(api => {
  api.versionsFrom(['2.8.0', '3.0.1']);
  api.use('isobuild:compiler-plugin@1.0.0');
});

Package.onTest(api => {
  api.versionsFrom(['2.8.0', '3.0.1']);
  api.use([
    'test-helpers', 'tinytest',
    'ecmascript',
    'illusionfield:scss'
  ]);

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

  api.addFiles('test/scss/top2.scss', 'client', { lazy: true });

  // Test for includePaths (not implemented)
  //api.addFiles(['test/include-paths/include-paths.scss', 'test/include-paths/modules/module/_module.scss']);

  api.mainModule('tests.js', 'client');
});
