let readable = false;
let indent = -1;
let tab = '';
let br = '';

// Printer object (AST -> str)
function pr_str(ast, print_readably) {
  readable = print_readably;
  tab = readable ? "\t" : "";
  br = readable ? "\n" : "";

  return print_form(ast);
}

// Mirror similar mutual recursion from the reader
function print_form(ast) {
  if (ast instanceof Array) {    
    return print_list(ast);
  } else if (ast instanceof Function) {
    return print_function(ast);
  } else if (ast instanceof Object && ast.fn) {
    return print_function(ast);
  } else {
    return print_atom(ast);
  }
}

// Wraps lists in parens and joins the atoms by spaces
function print_list(ast) {
  const peek = ast[1];
  indent++;

  const tabs = tab.repeat(indent);
  const ifBr = indent ? br : '';
  const ifTabs = indent ? tabs : '';
  
  let list = `${ifBr}${ifTabs}(${ast.map(print_form).join(" ")}`;
  
  indent--;
  
  console.log(peek);
  console.log(list);
  
  if (peek && !(peek instanceof Array)) {
    list = `${list})${br}${tabs}`;
  } else if (peek) {
    list = `${list}${tabs})`;
  } else {
    list = `${list})`;
  }

  return list;
}

function print_function(ast) {
  return "#<function>";
}

// For now just use JS's toString
function print_atom(ast) {
  if (ast == null) {
    return "nil";
  }
  return ast.toString();
}

// Creates a global "registry" for language symbols
const reg = {};

const add = sym => {
  reg[sym] = sym;
  return sym;
};

const get = sym => reg[sym];

// Maps some domain concepts to underlying JS implementation of a "list"
const isEmpty = list => list.length === 0;
const isList = list => list instanceof Array;

// List functions are actual JS functions
const isFunction = func => func instanceof Function;

// Symbol helpers
const isSymbol = s => Boolean( get( s ) );

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
};

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

// Reader functions (str -> AST)
// A basic reader object onto an array of tokens
class Reader {
    constructor (tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    peek () {
        return this.tokens[this.position];
    }

    next () {
        return this.tokens[this.position++];
    }
}

// Regexp based tokenizer
function tokenizer(str) {
    // regexp below taken from step 1 of make-a-lisp guide
    const regexp = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"|;.*|[^\s\[\]{}('"`,;)]*)/g;
    const results = [];
    let match;

    // continuously executes the regexp against the str until it matches nothing
    while ((match = regexp.exec( str )[1]) != '') {
        if (match[0] === ';') { continue; }
        results.push( match );
    }

    return results;
}

// Reads a lisp "form" from the reader object
function read_form(reader) {
    const token = reader.peek();
    if (token === undefined && (reader.position === reader.tokens.length)) {
        throw Error('Found end of input! Do you have unbalanced parenthesis?');
    }
    switch (token[0]) {
        case ';':
            return null;
        case '(':
            reader.next();
            return read_list(reader);
        default:
            return read_atom(reader.next());
    }
}

// Mutually recursive with the above function to build lists inside lists
function read_list(reader) {
    const list = [];
    while (reader.peek() !== ')') {
        list.push( read_form( reader ) );
    }
    reader.next(); // Move reader past the end of the list since were done now
    return list;
}

// Given a token converts it into some kind of atom
function read_atom(token) {
    // First try to see if it is parseable as a number
    const tryFloat = Number.parseFloat( token );
    if (!Number.isNaN( tryFloat )) {
        return tryFloat;
    } else {
        // If it starts with a quote character, its a string
        if (token[0] === '"') {
            return token.slice(1, token.length - 1);
        }
        switch (token) {
            // Literal string to primitive type conversion
            case lang.true:
                return true;
            case lang.false:
                return false;
            case lang.nil:
                return null;
            default:
                // Symbols are defined globally in the runtime and reference stuff in env, etc.
                return add(token);
        }
    }
}

// Ties above together
var read_str = function (str) {
  const tokens = tokenizer( str );
  if (tokens.length === 0) {
    return null;
  }
  return read_form( new Reader( tokens ) );
};

// Stores values at a symbol for later retrieval.
// If a symbol isn't found in this env, look for it in outer
var Env = class {
    // Binds & expressions are lists to do a "bulk set" at initialization time
    constructor (outer = null, binds=[], exprs=[]) {
        this.outer = outer;
        this.data = {};
        this.keys = [];

        for (var i = 0; i < binds.length; i++) {
            this.setSymbol(binds[i], exprs[i]);
        }
    }

    setSymbol (symbol, value) {
      this.data[symbol] = value;
      this.keys.push(symbol);
    }

    findSymbol (symbol) {
        if (!isSymbol(symbol)) throw Error(`"${symbol}" is not a symbol`);

        if (this.data[symbol] !== undefined) {
            return this;
        } else {
            if (this.outer) return this.outer.findSymbol( symbol );
        }
    }

    getSymbol (symbol) {
        if (!isSymbol(symbol)) throw Error(`"${symbol}" is not a symbol`);

        const maybeEnv = this.findSymbol(symbol);
        if (maybeEnv) {
            return maybeEnv.data[symbol];
        } else {
            throw Error(`Symbol "${symbol}" not found in any environments`);
        }
    }
};

// Helper for debugging inside eval
function debugLog(ast) {
  console.log( pr_str( ast ) );
}

// Build an export the repl env from core.ns
const repl_env = new Env();
Object.keys(ns).forEach(symbol => {
  repl_env.setSymbol(symbol, ns[symbol]);
});

// Manually adding in 'eval' here to avoid a cirular dependency
repl_env.setSymbol( 'eval', (ast) => EVAL(ast, repl_env) );

function eval_ast(ast, env) {
  if (isList(ast)) {
    return ast.map(a => EVAL(a, env));
  } else if (isSymbol(ast)) {
    return env.getSymbol(ast);
  } else {
    return ast;
  }
}

// If the ast is a list this "applies" the first element in the list to the rest of the list
function EVAL (ast, env, debug = false) {
  while (true) {
    if (isList(ast)) {
      if (ast.length === 0) {
        return ast;
      } else {
        if (debug) debugLog(ast);
        const [special, param, list] = ast;
        switch (special) {
          case lang.def:
            const result = EVAL(list, env);
            env.setSymbol(param, result);
            return result;
          case lang.let:
            const letEnv = new Env(env);
            for (var pairIdx = 0; pairIdx < param.length; pairIdx += 2) {
              letEnv.setSymbol(
                param[pairIdx],
                EVAL(param[pairIdx + 1], letEnv)
              );
            }
            env = letEnv;
            ast = list;
            break;
          case lang.do:
            const evaledList = eval_ast(ast.slice(1, ast.length - 1), env);
            ast = ast[ast.length - 1];
            break;
          case lang.if:
            const [_, condition, trueList, falseList] = ast;
            const evaledCondition = EVAL(condition, env);
            if (evaledCondition === null || evaledCondition === false) {
              if (!falseList) return null;

              ast = falseList;
              break;
            }
            ast = trueList;
            break;
          case lang.fn:
            // TCO part
            const ret = {
              ast: list,
              params: param,
              env: env,
              fn: function(args) {
                const fnEnv = new Env(env, param, args);
                console.log('New function env!');
                console.log(fnEnv);
                return EVAL(list, fnEnv);
              }
            };
            return ret;
          default:
            const [op, ...rest] = eval_ast(ast, env);
            if (isFunction(op)) {
              return op(rest);
            }
            const fnEnv = new Env(op.env, op.params, rest);
            ast = op.ast;
            env = fnEnv;
        }
      }
    } else {
      if (debug) debugLog(ast);
      return eval_ast(ast, env);
    }
  }
}

// Main interface to the lisp
function repl (str) {
  return pr_str( EVAL( read_str( str ), repl_env ) );
}

export { read_str as READ, EVAL, pr_str as PRINT, repl_env as env, repl };
