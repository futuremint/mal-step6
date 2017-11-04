// Reader functions (str -> AST)
import { lang } from './core.js';
import { add as addSymbol } from '../impl/symregistry.js';

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
                return addSymbol(token);
        }
    }
}

// Ties above together
export default function (str) {
  const tokens = tokenizer( str );
  if (tokens.length === 0) {
    return null;
  }
  return read_form( new Reader( tokens ) );
}
