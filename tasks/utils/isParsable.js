import { parser } from '@bpmn-io/lezer-feel';

/**
 * Test if a function is parsable
 * @param {import('@camunda/feel-builtins').Builtin} builtin
 * @returns {boolean}
 */
export function isParsable(builtin) {
  try {

    // Try to parse a simple expression using the function
    const paramsList = builtin.params?.map((p) => 'null').join(', ') || '';
    const expression = `${builtin.name}(${paramsList})`;
    const tree = parser.parse(expression);

    // Check if the parse tree contains any error nodes
    const hasErrors = tree.topNode.toString().includes('⚠');

    return !hasErrors;
  } catch (error) {
    return false;
  }
}
