export * from './builtins';
export * from './language';

/**
 * @typedef {object} Builtin
 * @property {string} name
 * @property {string} description
 */

/**
 * @typedef {object} Variable
 * @property {string} name name or key of the variable
 * @property {string} [info] short information about the variable, e.g. type
 * @property {string} [detail] longer description of the variable content
 * @property {boolean} [isList] whether the variable is a list
 * @property {Array<Variable>} [schema] array of child variables if the variable is a context or list
 * @property {'function'|'variable'} [type] type of the variable
 * @property {Array<{name: string, type: string}>} [params] function parameters
 */