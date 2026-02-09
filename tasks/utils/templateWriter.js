import { readFile, writeFile } from 'node:fs/promises';

const CAMUNDA_BUILTINS_PLACEHOLDER = '/** CAMUNDA_BUILTINS_PLACEHOLDER */ []';

/**
 * Write builtins to the destination file using the template
 * @param {string} templatePath
 * @param {string} destinationPath
 * @param {import('@camunda/feel-builtins').Builtin[]} builtins
 */
export async function writeBuiltinsFromTemplate(templatePath, destinationPath, builtins) {
  const template = await readFile(templatePath, 'utf-8');
  const content = template.replace(CAMUNDA_BUILTINS_PLACEHOLDER, JSON.stringify(builtins, null, 2));

  await writeFile(destinationPath, content);
}
