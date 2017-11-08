import { READ, EVAL, PRINT, env, repl } from '../repl.js';

export default tree;

// Local state
let lastStep, button, output, input;
let nextPhase = 0;

// Phases to move through when clicking the button
const stepPhases = [
  READ,
  (input) => EVAL( input, env, true )
];

// Wires up the logic to the UI
function tree (trigger, out, inputBox) {
  button = trigger;
  output = out;
  input = inputBox;
  button.addEventListener( 'click', nextStep );
}

// Click handler that steps through the different phases of REPL
function nextStep() {
  const phase = stepPhases[nextPhase];
  const code = !lastStep ? input.value : lastStep;
  
  lastStep = phase( code );
  output.innerText = PRINT(lastStep, true);
  nextPhase++;
}