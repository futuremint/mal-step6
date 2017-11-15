import { READ, EVAL, PRINT, env, repl } from './lisp/repl.js';
import { runTests } from './tests.js';
import tree from './tools/tree.js';

// Interface to the HTML page
let userInput;
let userOutput;
let lastInput = '';

// Main UI
export default function (window) {
  // Useful for debugging
  debuggingHelpers(window);
  
  userInput = getEl( 'in' );
  userOutput = getEl( 'out' );

  // Wire up the event handlers
  getEl( 'test' ).addEventListener( 'click', () => runTests( userInput, repl ) );
  userInput.addEventListener( 'keydown', inputKeyHandler );
  userInput.focus();
  
  // Step eval tree UI
  tree( getEl( 'step' ), getEl( 'tree' ), userInput);

  // For now just always run the tests
  // runTests(userInput, repl);
}

// Helper Functions
const getEl = name => document.getElementById( name );

const inputKeyHandler = (e) => {
  const key = e.key;
  switch (key) {
    case 'Enter':
      lastInput = userInput.value;
      userOutput.value = repl( userInput.value ); 
      userInput.value = '';
      break;
    case 'ArrowUp':
      userInput.value = lastInput;
      break;
    default:
      break;
  }
}

const debuggingHelpers = (window) => {
  window.repl_env = env;
  window.READ = READ;
  window.PRINT = PRINT;
  window.EVAL = EVAL;
}