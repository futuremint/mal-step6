import { READ, EVAL, PRINT, env, repl } from '../lisp/repl.js';

export default tree;

let lastStep, button, output, input;
let nextPhase = 0;
const stepPhases = [
  READ,
  (input) => EVAL( input, env, true )
];

function tree (trigger, out, inputBox) {
  button = trigger;
  output = out;
  input = inputBox;
  button.addEventListener( 'click', nextStep );
}

function nextStep() {
  const phase = stepPhases[nextPhase];
  const code = !lastStep ? input.value : lastStep;
  
  lastStep = phase( code );
  output.innerText = PRINT(lastStep, true);
  nextPhase++;
}