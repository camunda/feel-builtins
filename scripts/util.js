/**
 * @typedef {object} Descriptor
 * @property {string} name
 * @property {string} description
 */

/**
 * @param { Descriptor[] } descriptors
 *
 * @returns {import('../src').Builtin[] }
 */
export function parseBuiltins(descriptors) {
  return descriptors.map(parseBuiltin);
}

/**
 * @param { Descriptor } descriptor
 *
 * @returns { import('../src').Builtin }
 */
export function parseBuiltin(descriptor) {

  const {
    name,
    description
  } = descriptor;

  const match = name.match(/^([\w\s]+)\((.*)\)$/);
  const functionName = match[1];
  const functionArguments = match[2];

  // parameterless function matches as empty string
  const params = functionArguments ? functionArguments.split(', ').map(name => ({ name })) : [];

  return {
    name: functionName,
    type: 'function',
    params,
    info: description,
    boost: 0
  };
}


