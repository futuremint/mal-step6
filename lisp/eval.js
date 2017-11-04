import { pr_str } from "./printer.js";
import Env from "./env.js";
import { isList, isSymbol, isFunction, lang, ns } from "./core.js";

export { EVAL, repl_env };

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