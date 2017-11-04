// Stores values at a symbol for later retrieval.
// If a symbol isn't found in this env, look for it in outer
import { isSymbol } from './core.js';

export default class {
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
}