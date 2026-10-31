const ts = require('typescript');

module.exports = {
  process(source, fileName) {
    const result = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName,
    });

    return { code: result.outputText };
  },
};
