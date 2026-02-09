import { parser } from '@bpmn-io/lezer-feel';

/**
 * Test if a function is parsable
 * @param {import('@camunda/feel-builtins').Builtin} builtin
 * @returns {boolean}
 */
function isParsable(builtin) {
  try {
    const paramsList = builtin.params?.map((p) => 'null').join(', ') || '';
    const expression = `${builtin.name}(${paramsList})`;
    const tree = parser.parse(expression);
    const hasErrors = tree.topNode.toString().includes('⚠');
    return !hasErrors;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a builtin is a Camunda extension
 * @param {import('@camunda/feel-builtins').Builtin} builtin
 * @returns {boolean}
 */
function isCamundaExtension(builtin) {
  return builtin.info?.includes('Camunda Extension') || false;
}

/**
 * Categorize builtins into FEEL standard functions and Camunda extensions
 * @param {import('@camunda/feel-builtins').Builtin[]} builtins
 * @returns {{
 *   feelBuiltins: import('@camunda/feel-builtins').Builtin[],
 *   camundaExtensions: import('@camunda/feel-builtins').Builtin[],
 *   unparsableBuiltins: import('@camunda/feel-builtins').Builtin[]
 * }}
 */
export function categorizeBuiltins(builtins) {
  const feelBuiltins = [];
  const camundaExtensions = [];
  const unparsableBuiltins = [];

  for (const builtin of builtins) {
    if (!isParsable(builtin)) {
      unparsableBuiltins.push(builtin);
    }

    if (isCamundaExtension(builtin)) {
      camundaExtensions.push(builtin);
    } else {
      feelBuiltins.push(builtin);
    }
  }

  return {
    feelBuiltins,
    camundaExtensions,
    unparsableBuiltins,
  };
}

/**
 * Log categorization statistics
 * @param {{
 *   feelBuiltins: import('@camunda/feel-builtins').Builtin[],
 *   camundaExtensions: import('@camunda/feel-builtins').Builtin[],
 *   unparsableBuiltins: import('@camunda/feel-builtins').Builtin[]
 * }} categorized
 */
export function logStatistics(categorized) {
  const { feelBuiltins, camundaExtensions, unparsableBuiltins } = categorized;

  console.log(`FEEL built-ins: ${feelBuiltins.length}`);
  console.log(`Camunda extensions: ${camundaExtensions.length}`);
  console.log(`Unparsable functions: ${unparsableBuiltins.length}`);

  if (unparsableBuiltins.length > 0) {
    console.log('Unparsable:', unparsableBuiltins.map((b) => b.name).join(', '));
  }
}
