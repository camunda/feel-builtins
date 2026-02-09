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
    let hasError = false;
    tree.iterate({
      enter: (nodeRef) => {
        if (nodeRef.type.isError) {
          hasError = true;
          return false; // stop iterating deeper on first error
        }
      }
    });
    return !hasError;
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
 * Categorize builtins into FEEL standard functions Camunda extensions and list ones using reserved keywords.
 * @param {import('@camunda/feel-builtins').Builtin[]} builtins
 * @returns {{
 *   feelBuiltins: import('@camunda/feel-builtins').Builtin[],
 *   camundaExtensions: import('@camunda/feel-builtins').Builtin[],
 *   camundaReservedNameBuiltins: import('@camunda/feel-builtins').Builtin[]
 * }}
 */
export function categorizeBuiltins(builtins) {
  const feelBuiltins = [];
  const camundaExtensions = [];
  const camundaReservedNameBuiltins = [];

  for (const builtin of builtins) {
    if (!isParsable(builtin)) {
      camundaReservedNameBuiltins.push(builtin);
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
    camundaReservedNameBuiltins,
  };
}

/**
 * Log categorization statistics
 * @param {{
 *   feelBuiltins: import('@camunda/feel-builtins').Builtin[],
 *   camundaExtensions: import('@camunda/feel-builtins').Builtin[],
 *   camundaReservedNameBuiltins: import('@camunda/feel-builtins').Builtin[]
 * }} categorized
 */
export function logStatistics(categorized) {
  const { feelBuiltins, camundaExtensions, camundaReservedNameBuiltins } = categorized;

  console.log(`FEEL built-ins: ${feelBuiltins.length}`);
  console.log(`Camunda extensions: ${camundaExtensions.length}`);
  console.log(`Camunda extensions with reserved names: ${camundaReservedNameBuiltins.length}`);

  if (camundaReservedNameBuiltins.length > 0) {
    console.log('Reserved names:', camundaReservedNameBuiltins.map((b) => b.name).join(', '));
  }
}
