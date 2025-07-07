/**
 * @param { import('..').Variable[] } variables
 *
 * @return {Record<string, any>}
 */
export function createContext(variables) {
  return variables.slice().reverse().reduce((context, builtin) => {
    context[builtin.name] = () => {};

    return context;
  }, {});
}