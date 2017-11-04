let readable = false;
let indent = -1;
let tab = '';
let br = '';

// Printer object (AST -> str)
export function pr_str(ast, print_readably) {
  readable = print_readably;
  tab = readable ? "\t" : "";
  br = readable ? "\n" : "";

  return print_form(ast);
};

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
    list = `${list}${tabs})`
  } else {
    list = `${list})`
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