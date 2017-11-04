const lisp = require('./repl');
const tests = require('./tests');

// runTests sets value prop on its first argument
const mockInput = { value: '' };

tests.runTests( mockInput, lisp.repl );