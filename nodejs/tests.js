'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Runs through all tests, putting test string in input as it goes
function runTests(inputArg, replArg) {
  // Sets context
  input = inputArg;
  repl = replArg;
  
  // Runs them all
  step3Tests.forEach(assert);
  step4Tests.forEach(assert);
  step5Tests.forEach(assert);
  step6Tests.forEach(assert);
}

// A primitive asserter
let input;
let repl;
function assert ([code, result]) {
    console.info(`Testing "${code}"`);
    input.value = code;
    const tryResult = repl( code );
    if (tryResult !== result) {
      console.error( `Expected "${tryResult}" to be "${result}"` );
    }  
}

const step3Tests = [
    ['(+ 1 2)','3'],
    ['(/ (- (+ 5 (* 2 3)) 3) 4)', '2'],
    ['(def! x 3)', '3'],
    ['x', '3'],
    ['(def! x 4)', '4'],
    ['x', '4'],
    ['(def! x 4)', '4'],
    ['(def! y (+ 1 7))', '8'],
    ['(def! mynum 111)', '111'],
    ['(def! MYNUM 222)', '222'],
    ['mynum', '111'],
    ['MYNUM', '222'],
    ['(def! w 123)(def! w (abc)) w', '123'],
    ['(let* (z 9) z)', '9'],
    ['(let* (x 9) x)', '9'],
    ['x', '4'],
    ['(let* (z (+ 2 3)) (+ 1 z))', '6'],
    ['(let* (p (+ 2 3) q (+ 2 p)) (+ p q))', '12'],
    ['(def! y (let* (z 7) z)) y', '7']
];

const step4Tests = [
    // Testing list functions
    ['(list)', '()'],
    ['(list? (list))', 'true'],
    ['(empty? (list))', 'true'],
    ['(empty? (list 1))', 'false'],
    ['(list 1 2 3)', '(1 2 3)'],
    ['(count (list 1 2 3))', '3'],
    ['(count (list))', '0'],
    ['(count nil)', '0'],
    ['(if (> (count (list 1 2 3)) 3) "yes" "no")', 'no'],
    ['(if (>= (count (list 1 2 3)) 3) "yes" "no")', 'yes'],

    // Testing if form
    ['(if true 7 8)', '7'],
    ['(if false 7 8)', '8'],
    ['(if true (+ 1 7) (+ 1 8))', '8'],
    ['(if false (+ 1 7) (+ 1 8))', '9'],
    ['(if nil 7 8)', '8'],
    ['(if 0 7 8)', '7'],
    ['(if "" 7 8)', '7'],
    ['(if (list) 7 8)', '7'],
    ['(if (list 1 2 3) 7 8)', '7'],
    ['(= (list) nil)', 'false'],

    //  Testing 1-way if form
    ['(if false (+ 1 7))', 'nil'],
    ['(if nil 8 7)', '7'],
    ['(if true (+ 1 7))', '8'],

    // Testing basic conditionals
    ['(= 2 1)', 'false'],
    ['(= 1 1)', 'true'],
    ['(= 1 2)', 'false'],
    ['(= 1 (+ 1 1))', 'false'],
    ['(= 2 (+ 1 1))', 'true'],
    ['(= nil 1)', 'false'],
    ['(= nil nil)', 'true'],

    ['(> 2 1)', 'true'],
    ['(> 1 1)', 'false'],
    ['(> 1 2)', 'false'],

    ['(>= 2 1)', 'true'],
    ['(>= 1 1)', 'true'],
    ['(>= 1 2)', 'false'],

    ['(< 2 1)', 'false'],
    ['(< 1 1)', 'false'],
    ['(< 1 2)', 'true'],

    ['(<= 2 1)', 'false'],
    ['(<= 1 1)', 'true'],
    ['(<= 1 2)', 'true'],

    // Testing equality
    ['(= 1 1)', 'true'],
    ['(= 0 0)', 'true'],
    ['(= 1 0)', 'false'],
    ['(= "" "")', 'true'],
    ['(= "abc" "abc")', 'true'],
    ['(= "abc" "")', 'false'],
    ['(= "" "abc")', 'false'],
    ['(= "abc" "def")', 'false'],
    ['(= "abc" "ABC")', 'false'],

    ['(= (list) (list))', 'true'],
    ['(= (list 1 2) (list 1 2))', 'true'],
    ['(= (list 1) (list))', 'false'],
    ['(= (list) (list 1))', 'false'],
    ['(= 0 (list))', 'false'],
    ['(= (list) 0)', 'false'],
    ['(= (list) "")', 'false'],
    ['(= "" (list))', 'false'],

    // Testing builtin and user defined functions
    ['(+ 1 2)', '3'],
    ['( (fn* (a b) (+ b a)) 3 4)', '7'],
    ['( (fn* () 4) )', '4'],

    ['( (fn* (f x) (f x)) (fn* (a) (+ 1 a)) 7)', '8'],


    // Testing closures
    ['( ( (fn* (a) (fn* (b) (+ a b))) 5) 7)', '12'],

    ['(def! gen-plus5 (fn* () (fn* (b) (+ 5 b))))', '#<function>'],
    ['(def! plus5 (gen-plus5))', '#<function>'],
    ['(plus5 7)', '12'],

    ['(def! gen-plusX (fn* (x) (fn* (b) (+ x b))))', '#<function>'],
    ['(def! plus7 (gen-plusX 7))', '#<function>'],
    ['(plus7 8)', '15'],

    // Testing do form
    ['(do (prn "prn output1"))', 'prn output1'],
    ['(do (prn "prn output2") 7)', '7'],
    ['(do (prn "prn output1") (prn "prn output2") (+ 1 2))', '3'],

    ['(do (def! a 6) 7 (+ a 8))', '14'],
    ['a', '6'],

    // Testing special form case-sensitivity
    ['(def! DO (fn* (a) 7))', '#<function>'],
    ['(DO 3)', '7'],

    // Testing recursive sumdown function
    ['(def! sumdown (fn* (N) (if (> N 0) (+ N (sumdown  (- N 1))) 0)))', '#<function>'],
    ['(sumdown 1)', '1'],
    ['(sumdown 2)', '3'],
    ['(sumdown 6)', '21'],


    // Testing recursive fibonacci function
    ['(def! fib (fn* (N) (if (= N 0) 1 (if (= N 1) 1 (+ (fib (- N 1)) (fib (- N 2)))))))', '#<function>'],
    ['(fib 1)', '1'],
    ['(fib 2)', '2'],
    ['(fib 4)', '5'],
    ['(fib 10)', '89']
];

const step5Tests = [
  // Testing recursive tail-call function
  ['(def! sum2 (fn* (n acc) (if (= n 0) acc (sum2 (- n 1) (+ n acc)))))','#<function>'],

  // TODO: test let*, and do for TCO
  ['(sum2 10 0)','55'],
  ['(def! res2 nil)', 'nil'],
  ['(def! res2 (sum2 10000 0)) res2', '50005000'],

  // Test mutually recursive tail-call functions
  ['(def! foo (fn* (n) (if (= n 0) 0 (bar (- n 1)))))','#<function>'], 
  ['(def! bar (fn* (n) (if (= n 0) 0 (foo (- n 1)))))','#<function>'],
  ['(foo 10000)', '0'],
  ['(do (do 1 2))', '2']
];

const step6Tests = [
  // Testing read-string
  ['(read-string "(1 2 (3 4) nil)")', '(1 2 (3 4) nil)'],
  ['(read-string "(+ 2 3)")','(+ 2 3)'],
  ['(read-string "7 ;; comment")','7'],
  ['(read-string ";; comment")','nil'],
  
  // Testing eval
  ['(eval (read-string "(+ 2 3)"))','5']
];

exports.runTests = runTests;
exports.assert = assert;
exports.step3Tests = step3Tests;
exports.step4Tests = step4Tests;
exports.step5Tests = step5Tests;
exports.step6Tests = step6Tests;
