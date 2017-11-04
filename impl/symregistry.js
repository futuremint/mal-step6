// Creates a global "registry" for language symbols
const reg = {};

const add = sym => {
  reg[sym] = sym;
  return sym;
};

const get = sym => reg[sym];

export { add, get };