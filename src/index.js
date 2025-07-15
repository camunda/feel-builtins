import { domify } from 'min-dom';

import camundaBuiltinsJson from './camunda.json';

/**
 * @typedef {object} Builtin
 * @property {string} name name or key of the variable
 * @property {string|function} [info] description of the variable, string or a function that returns a DOM fragment
 * @property {string} [detail] longer description of the variable content
 * @property {boolean} [isList] whether the variable is a list
 * @property {Array<Variable>} [schema] array of child variables if the variable is a context or list
 * @property {'function'|'variable'} [type] type of the variable
 * @property {Array<{name: string, type: string}>} [params] function parameters
 */

/**
 * Collection of camunda builtins.
 *
 * @returns {Builtin[]}
 */
export const camundaBuiltins = camundaBuiltinsJson.map(builtin => (
  {
    ...builtin,
    info: () => domify(`<div class="description">${builtin.info}</div>`)
  }
));
