/**
 * @param { import('./markdownParser.js').BuiltinDescriptor[] } descriptors
 *
 * @returns {import('@camunda/feel-builtins').Builtin[] }
 */
export function parseBuiltins(descriptors) {
  return descriptors.map(parseBuiltin);
}

/**
 * @param { import('./markdownParser.js').BuiltinDescriptor } descriptor
 *
 * @returns { import('@camunda/feel-builtins').Builtin }
 */
export function parseBuiltin(descriptor) {

  const {
    name,
    description
  } = descriptor;

  const match = name.match(/^([\w\s]+)\((.*)\)$/);

  if (!match) {
    throw new Error(`failed to parse <${name}>`);
  }

  const functionName = match[1];
  const functionArguments = match[2];

  // parameterless function matches as empty string
  const params = functionArguments ? functionArguments.split(', ').map(name => ({ name })) : [];

  return {
    name: functionName,
    type: 'function',
    params,
    info: description
  };
}

