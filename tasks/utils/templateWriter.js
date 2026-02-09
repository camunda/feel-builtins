import { readFile, writeFile } from 'node:fs/promises';

const FEEL_BUILTINS_PLACEHOLDER = '/** FEEL_BUILTINS_PLACEHOLDER */ []';
const CAMUNDA_EXTENSIONS_PLACEHOLDER = '/** CAMUNDA_EXTENSIONS_PLACEHOLDER */ []';
const CAMUNDA_UNPARSABLE_BUILTINS_PLACEHOLDER = '/** CAMUNDA_UNPARSABLE_BUILTINS_PLACEHOLDER */ []';

/**
 * Write builtins to the destination file using the template
 * @param {string} templatePath
 * @param {string} destinationPath
 * @param {Object} categorized
 * @param {import('@camunda/feel-builtins').Builtin[]} categorized.feelBuiltins
 * @param {import('@camunda/feel-builtins').Builtin[]} categorized.camundaExtensions
 * @param {import('@camunda/feel-builtins').Builtin[]} categorized.unparsableBuiltins
 */
export async function writeBuiltinsFromTemplate(templatePath, destinationPath, categorized) {
  const { feelBuiltins, camundaExtensions, unparsableBuiltins } = categorized;

  const template = await readFile(templatePath, 'utf-8');
  let content = template
    .replace(FEEL_BUILTINS_PLACEHOLDER, JSON.stringify(feelBuiltins, null, 2))
    .replace(CAMUNDA_EXTENSIONS_PLACEHOLDER, JSON.stringify(camundaExtensions, null, 2))
    .replace(CAMUNDA_UNPARSABLE_BUILTINS_PLACEHOLDER, JSON.stringify(unparsableBuiltins, null, 2));

  await writeFile(destinationPath, content);
}
