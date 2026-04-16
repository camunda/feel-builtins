import { camundaBuiltins } from '../src/camundaBuiltins.js';

const defaultMinimumVersion = '8.6';
const minimumVersion = process.argv[2] || defaultMinimumVersion;

const functionsByName = new Map();

for (const builtin of camundaBuiltins) {
  const engine = getCamundaMinimumVersion(builtin);

  if (!engine || compareVersions(engine, minimumVersion) <= 0) {
    continue;
  }

  const currentEngine = functionsByName.get(builtin.name);

  if (!currentEngine || compareVersions(engine, currentEngine) < 0) {
    functionsByName.set(builtin.name, engine);
  }
}

const functions = Array.from(functionsByName.entries())
  .sort((leftEntry, rightEntry) => {
    const [ leftName, leftEngine ] = leftEntry;
    const [ rightName, rightEngine ] = rightEntry;

    return compareVersions(leftEngine, rightEngine) || leftName.localeCompare(rightName);
  });

for (const [ name, engine ] of functions) {
  console.log(`${engine} ${name}`);
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

/**
 * @param {{ engines?: { camunda?: string } }} builtin
 * @returns {string|undefined}
 */
function getCamundaMinimumVersion(builtin) {
  const versionRange = builtin.engines?.camunda;

  if (!versionRange) {
    return;
  }

  const match = versionRange.match(/^>=\s*(\d+(?:\.\d+)*)$/);

  if (!match) {
    throw new Error(`unsupported Camunda engine range <${versionRange}>`);
  }

  return match[1];
}