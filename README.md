# Make A Lisp
## JS version

Working through make-a-lisp, but putting in Glitch. This version is a remix of my step5. It uses Rollup.js to compile `lisp/repl.js` and `tests.js` into CommonJS format. In the console type `npm test` to run the make-a-lisp tests using nodejs. Look at `nodejs/run-tests.js` for how it loads up the modules and runs the tests (its the same code the browser uses).

## Guide
[Make A Lisp Guide](https://github.com/kanaka/mal/blob/master/process/guide.md)
[Current status](https://github.com/kanaka/mal/blob/master/process/guide.md#step-5-tail-call-optimization)

## ToDo (i.e. things that are broken, or new ideas)
- Loading up the env is broken because of how server.js serves file from public. If your browser supports ES6 modules natively, the paths aren't correct right now, `server.js` needs to serve up the `lisp` directory (or maybe have Rollup build a single file for web?).
- On step 6, eval is created but doesn't work right (returns "nil")
- Trying to make a "ast" viewer
- Want to make a stepping debugger that uses the viewer for rendering