import { glob } from 'glob';
import { marked } from 'marked';
import { readFile, writeFile } from 'node:fs/promises';
import { parseBuiltins } from './utils/parseBuiltins.js';

// paths relative to CWD
const MARKDOWN_SRC = './camunda-docs/docs/components/modeler/feel/builtin-functions/*.md';
const JS_SRC = './tasks/camundaBuiltins.template.js';
const JS_DEST = './lib/camundaBuiltins.js';

const CAMUNDA_BUILTINS_PLACEHOLDER = '/** CAMUNDA_BUILTINS_PLACEHOLDER */ []';

/**
 * @typedef { import('./utils/parseBuiltins.js').BuiltinDescriptor } BuiltinDescriptor
 */

/**
 * @param {string} fileName
 *
 * @return { Promise<BuiltinDescriptor[]> }
 */
async function parseFile(fileName) {

  const fileContent = await readFile(fileName, 'utf-8');

  const [ _heading, ...contents ] = fileContent.split('## ');

  const descriptions = await Promise.all(
    contents.flatMap(async string => {
      const name = string.split('\n')[0];
      let description = await Promise.resolve(
        marked.parse(string.split('\n').slice(1).join('\n'))
      );

      description = description.replace('<MarkerCamundaExtension></MarkerCamundaExtension>', '<em>Camunda Extension</em>');

      // e.g. "and() / all()"
      if (name.includes('/')) {
        throw new Error(`unsupported built-in name <${ name }>`);
      }

      return { name, description };
    })
  );

  return descriptions;
}

async function run() {

  const files = await glob(MARKDOWN_SRC);

  const descriptors = (
    await Promise.all(
      files.sort().map(parseFile)
    )
  ).flat();

  const builtins = parseBuiltins(descriptors);

  const template = await readFile(JS_SRC, 'utf-8');
  const content = template.replace(CAMUNDA_BUILTINS_PLACEHOLDER, JSON.stringify(builtins, null, 2));

  await writeFile(JS_DEST, content);
}

run().catch(err => {
  console.error('Failed to compile built-ins', err);

  process.exit(1);
});