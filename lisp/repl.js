import READ from './reader.js';
import { pr_str as PRINT } from './printer.js';
import { EVAL, repl_env as env } from './eval.js';

// Exports individual components for UI
export { READ, EVAL, PRINT, env, repl };

// Main interface to the lisp
function repl (str) {
  return PRINT( EVAL( READ( str ), env ) );
}