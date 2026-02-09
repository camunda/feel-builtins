import { readFile, writeFile } from 'node:fs/promises';

const CAMUNDA_BUILTINS_PLACEHOLDER = '/** CAMUNDA_BUILTINS_PLACEHOLDER */ []';
const CAMUNDA_UNPARSABLE_BUILTINS_PLACEHOLDER = '/** CAMUNDA_UNPARSABLE_BUILTINS_PLACEHOLDER */ []';

/**
 * Write builtins to the destination file using the template
 * @param {string} templatePath
 * @param {string} destinationPath
 * @param {Object} categorized
 * @param {import('@camunda/feel-builtins').Builtin[]} categorized.allBuiltins
 * @param {import('@camunda/feel-builtins').Builtin[]} categorized.unparsableBuiltins
 */
export async function writeBuiltinsFromTemplate(templatePath, destinationPath, categorized) {
  const { allBuiltins, unparsableBuiltins } = categorized;

  const template = await readFile(templatePath, 'utf-8');
  let content = template
    .replace(CAMUNDA_BUILTINS_PLACEHOLDER, JSON.stringify(allBuiltins, null, 2))
    .replace(CAMUNDA_UNPARSABLE_BUILTINS_PLACEHOLDER, JSON.stringify(unparsableBuiltins, null, 2));

  await writeFile(destinationPath, content);
}
