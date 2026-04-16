/**
 * @param { import('./markdownParser.js').BuiltinDescriptor[] } descriptors
 * @param { import('./markdownParser.js').BuiltinDescriptor[] } [supportedDescriptors]
 *
 * @returns {import('@camunda/feel-builtins').Builtin[] }
 */
export function parseBuiltins(descriptors, supportedDescriptors = descriptors) {
  const earliestSupportedEngines = getEarliestSupportedEngines(supportedDescriptors);

  return descriptors.map((descriptor) => parseBuiltin(descriptor, earliestSupportedEngines.get(descriptor.name)));
}

/**
 * @param { import('./markdownParser.js').BuiltinDescriptor } descriptor
 * @param { string } [engine]
 *
 * @returns { import('@camunda/feel-builtins').Builtin }
 */
export function parseBuiltin(descriptor, engine = descriptor.engine) {

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
    ...(engine ? {
      engines: {
        camunda: `>=${engine}`
      }
    } : {}),
    type: 'function',
    params,
    info: description
  };
}

/**
 * @param { import('./markdownParser.js').BuiltinDescriptor[] } descriptors
 *
 * @returns { Map<string, string> }
 */
function getEarliestSupportedEngines(descriptors) {
  const earliestSupportedEngines = new Map();

  for (const descriptor of descriptors) {
    if (!descriptor.engine) {
      continue;
    }

    const currentEngine = earliestSupportedEngines.get(descriptor.name);

    if (!currentEngine || compareVersions(descriptor.engine, currentEngine) < 0) {
      earliestSupportedEngines.set(descriptor.name, descriptor.engine);
    }
  }

  return earliestSupportedEngines;
}

/**
 * @param {string} left
 * @param {string} right
 * @returns {number}
 */
function compareVersions(left, right) {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index++) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0);

    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}

