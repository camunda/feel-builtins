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
