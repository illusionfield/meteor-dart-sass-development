import { MultiFileCachingCompiler } from 'meteor/caching-compiler';

import sass from 'sass-embedded';

const { fs, path } = Plugin;

import { pathToFileURL } from 'url';

Plugin.registerCompiler({
  extensions: ['scss', 'sass'],
  archMatching: 'web'
}, () => new SassCompiler())

console.log(Package, Plugin);

// CompileResult is {css, sourceMap}.
class SassCompiler extends MultiFileCachingCompiler {
  constructor () {
    super({
      compilerName: 'sass',
      defaultCacheSize: 1024 * 1024 * 10
    })
  }
  getCacheKey(inputFile) {
    return inputFile.getSourceHash();
  }
  compileResultSize(compileResult) {
    return compileResult.css?.length +
      this.sourceMapSize(compileResult.sourceMap)
  }

  // The heuristic is that a file is an import (ie, is not itself processed as a root) if it matches _*.sass, _*.scss
  // This can be overridden in either direction via an explicit `isImport` file option in api.addFiles.
  isRoot(inputFile) {
    const fileOptions = inputFile.getFileOptions();
    if(fileOptions.hasOwnProperty('isImport')) {
      return !fileOptions.isImport;
    }
    const pathInPackage = inputFile.getPathInPackage();
    return !this.hasUnderscore(pathInPackage);
  }
  hasUnderscore(file) {
    return path.basename(file).startsWith('_');
  }
  compileOneFileLater(inputFile, getResult) {
    inputFile.addStylesheet({
      path: inputFile.getPathInPackage()
    }, async () => {
      const result = await getResult();
      return result && {
        data: result.css,
        sourceMap: result.sourceMap
      }
    })
  }

  async compileOneFile(inputFile, allFiles) {
    const entryPoint = path.dirname(this.getAbsoluteImportPath(inputFile));
    const sourceRoot = inputFile.getSourceRoot();

    const addUnderscore = (file) => {
      if(!this.hasUnderscore(file)) {
        file = path.join(path.dirname(file), `_${path.basename(file)}`);
      }
      return file;
    }

    const getRealImportPath = (url) => {
      const basename = decodeURIComponent(url);
      let importPath;

      if(basename.match(/~([^\/])/)) {
        importPath = basename.replace(/^.*~([^\/])/, '{}/node_modules/$1');
      } else if(basename.startsWith('meteor:')) {
        importPath = basename.replace(/^meteor:/, '');
      } else {
        importPath = basename;
      }

      const isAbsolute = importPath.startsWith('/');
      if(!importPath.startsWith('{') && !isAbsolute) {
        importPath = path.join(entryPoint, importPath);
      }

      //SASS has a whole range of possible import files from one import statement, try each of them
      const possibleFiles = [];
      const possibleFilesIndex = [];

      //If the referenced file has no extension, try possible extensions, starting with extension of the parent file.
      let possibleExtensions = ['scss','sass','css'];

      if(!importPath.match(/\.s?(a|c)ss$/)){
        possibleExtensions = [
          inputFile.getExtension(),
          ...possibleExtensions.filter(e => e !== inputFile.getExtension())
          ]
        for (const extension of possibleExtensions){
          possibleFiles.push(`${importPath}.${extension}`);
          possibleFilesIndex.push(`${importPath}/index.${extension}`)
          possibleFilesIndex.push(`${importPath}/_index.${extension}`)
        }
      } else {
        possibleFiles.push(importPath);
      }

      //Try files prefixed with underscore
      for(const possibleFile of possibleFiles) {
        if(!this.hasUnderscore(possibleFile)) {
          possibleFiles.push(addUnderscore(possibleFile));
        }
      }

      //Try if one of the possible files exists
      for(const possibleFile of possibleFiles.concat(possibleFilesIndex)) {
        if((isAbsolute && fileExists(possibleFile)) || (!isAbsolute && allFiles.has(possibleFile))) {
          return { absolute: isAbsolute, path: possibleFile }
        }
      }

      //Nothing found...
      return null;

    };

    const findFileUrl = (url) => {
      const importPath = getRealImportPath(url);
      if(!importPath) {
        return null;
      }
      if(importPath.absolute) {
        return pathToFileURL(importPath.path);
      }
      const file = allFiles.get(importPath.path);
      if(file) {
        const absoluteUrl = path.join(file.getSourceRoot(), file.getPathInPackage());
        return pathToFileURL(absoluteUrl);
      }
      return null;
    }

    // Start compile sass (async)
    // https://sass-lang.com/documentation/js-api/interfaces/stringoptions
    const options = {
      sourceMap: true,
      sourceMapIncludeSources: true,
      syntax: inputFile.getExtension() === 'sass' ? 'indented' : 'scss',
      style: 'expanded',
      importers: [{findFileUrl}],

      // Entry point hack (if this is not set then the sass compiler will embedded data in the first file sourcemap sources)
      url: pathToFileURL(`{}/${inputFile.getPathInPackage()}`),
      //url: pathToFileURL(path.join(inputFile.getSourceRoot(), inputFile.getPathInPackage())),


      // temporary, will be set in config file
      //loadPaths: [],
      quietDeps: true,
      verbose: false,
      //logger: '',
    }

    // Compile
    let output;
    try {
      // the acompileStringAsync method is used because it is the only way to validate all imports with the options, e.g.: quietDeps
      output = await sass.compileStringAsync(inputFile.getContentsAsBuffer().toString('utf8'), options);
    } catch (e) {
      inputFile.error({
        message: `Scss compiler ${e}\n`,
        sourcePath: inputFile.getDisplayPath()
      });
      return null;
    }

    const allFilesByPath = new Map();
    for(const [absoluteImportPath, file] of allFiles.entries()) {
      const absolutePath = path.join(file.getSourceRoot(), file.getPathInPackage());
      allFilesByPath.set(absolutePath, absoluteImportPath);
    }

    // Get all referenced files for watcher
    const referencedImportPaths = [];
    referencedImportPaths.push(this.getAbsoluteImportPath(inputFile));

    if(output?.loadedUrls && output.loadedUrls.length > 0) {
      const skippedImportPaths = [];

      for(const loadedUrl of output.loadedUrls) {
        const absolutePath = decodeURIComponent(loadedUrl.pathname).replace(/\{\}\//, '');
        const absoluteUrl = allFilesByPath.get(absolutePath);
        if(absoluteUrl) {
          referencedImportPaths.push(absoluteUrl);
        } else {
          skippedImportPaths.push(absolutePath);
        }
      }

      if(skippedImportPaths.length) {
        console.warn(`\nLoaded file outside of sourceRoot (included but not tracked):\n ---- ${skippedImportPaths.join('\n ---- ')}\n`);
      }
    }

    // Fix source map
    const sourceMap = output?.sourceMap || null;
    if(sourceMap) {
      //sourceMap.sourceRoot = '.';
      sourceMap.sources = sourceMap.sources.map(src => {
        const url = new URL(src);
        switch(url.protocol) {
          case 'file:':
            let srcPath = decodeURIComponent(url.pathname).replace(new RegExp(`^${sourceRoot}/?`), '').replace(/^\{\}\//, '');
            // this is an attempt at standard-minifier-css compatibility
            //srcPath = (`app/${srcPath}`).replace('app//', 'app/');
            return srcPath;
          default:
            return src;
        }
      });
    }

    const compileResult = { css: output.css?.toString('utf-8'), sourceMap };
    return { compileResult, referencedImportPaths }
  }

  addCompileResult(inputFile, compileResult) {
    inputFile.addStylesheet({
      data: compileResult.css,
      path: `${inputFile.getPathInPackage()}.css`,
      sourceMap: compileResult.sourceMap
    })
  }
}

// --------------------------------------------------------------------------------------------

function fileExists(file) {
  if(fs.statSync){
    try {
      fs.statSync(file);
    } catch(e) {
      return false;
    }
    return true;
  } else if(fs.existsSync) {
    return fs.existsSync(file);
  }
}