import { pr_str } from './printer.js';
import read_str from './reader.js';
import { get as getSymbol } from '../impl/symregistry.js';

// Maps some domain concepts to underlying JS implementation of a "list"
const isEmpty = list => list.length === 0;
const isList = list => list instanceof Array;

// List functions are actual JS functions
const isFunction = func => func instanceof Function;

// Symbol helpers
const isSymbol = s => Boolean( getSymbol( s ) );

// Equality... ugh
const equal = ([a, b]) => {
  if (a === b) {
    return true;
  }
  if (isList(a) && isList(b)) {
    // Two empty lists are considered equal
    if (isEmpty(a) && isEmpty(b)) return true;
    // Two equal length lists have each item compared
    if (a.length === b.length) {
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    }
  }
  return false;
};

// Symbols in the core language used by the evaluator
// TODO not quite sure yet what these map to, just used in switch cases right now
const lang = {
  'true': 'true',
  'false': 'false',
  nil: 'nil',
  def: 'def!',
  let: 'let*',
  do: 'do',
  if: 'if',
  fn: 'fn*'
}

// Implemented using arrow functions for now, might change to named functions
// if things are slow?
const ns = {
  "+": ([fst, ...nums]) => nums.reduce((sum, num) => sum + num, fst),
  "-": ([fst, ...nums]) => nums.reduce((acc, num) => acc - num, fst),
  "*": ([fst, ...nums]) => nums.reduce((acc, num) => acc * num, fst),
  "/": ([fst, ...nums]) => nums.reduce((acc, num) => acc / num, fst),
  ">": ([a, b]) => a > b,
  "<": ([a, b]) => a < b,
  ">=": ([a, b]) => a >= b,
  "<=": ([a, b]) => a <= b,
  "=": equal,
  list: lst => lst,
  "list?": ([lst]) => isList(lst),
  "empty?": ([lst]) => isEmpty(lst),
  count: ([lst]) => (lst ? lst.length : 0),
  prn: ([str, rest]) => pr_str(str, true),
  'read-string': ([str]) => read_str(str),
};

// Export some helper functions to clean up other code
export{
  isEmpty, isSymbol, isList, isFunction, ns, lang, equal
}