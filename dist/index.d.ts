/**
 * Collection of builtins of camunda scala FEEL.
 */
export const camundaBuiltins: Builtin[];

/**
 * List of standard FEEL built-in functions (excluding Camunda-specific extensions).
 */
export const feelBuiltins: Builtin[];

/**
 * List of FEEL camunda extensions.
 */
export const camundaExtensions: Builtin[];

/**
 * Functions that cannot be parsed with lezer-feel without context.
 */
export const unparsableBuiltins: Builtin[];

export type Builtin = {
  /**
   * The name of the builtin function.
   */
  name: string;
  /**
   * A short description of the built-in function.
   */
  info: string;
  /**
   * Type of the builtin, always 'function' for builtin functions.
   */
  type?: 'function';
  /**
   * Function parameters.
   */
  params?: Array<{
    name: string;
  }>;
};
