import Eslint from './eslint';
const linter = new Eslint();

self.onmessage = message => {
  const { code, config, options } = message.data;
  self.postMessage(
    linter.verify(code, config, options).map(err => ({
      startLineNumber: err.line,
      endLineNumber: err.line,
      startColumn: err.column,
      endColumn: err.column,
      message: `${err.message} ${!err.fatal ? `(${err.ruleId})` : ''}`,
      severity: [0, 2, 3][err.severity],
      source: 'ESLint'
    }))
  );
};
