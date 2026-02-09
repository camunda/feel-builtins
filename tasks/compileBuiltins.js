import { glob } from 'glob';
import { isParsable, parseBuiltins, parseMarkdownFile, writeBuiltinsFromTemplate } from './utils/index.js';

// paths relative to CWD
const MARKDOWN_SRC = './camunda-docs/docs/components/modeler/feel/builtin-functions/*.md';
const JS_SRC = './tasks/camundaBuiltins.template.js';
const JS_DEST = './src/camundaBuiltins.js';

async function run() {
  const files = await glob(MARKDOWN_SRC);

  const descriptors = (await Promise.all(files.sort().map(parseMarkdownFile))).flat();

  const builtins = parseBuiltins(descriptors);

  // Identify unparsable functions
  const unparsableBuiltins = [];

  for (const builtin of builtins) {
    if (!isParsable(builtin)) {
      unparsableBuiltins.push(builtin);
    }
  }

  console.log(`Total functions: ${builtins.length}`);
  console.log(`Unparsable functions: ${unparsableBuiltins.length}`);

  if (unparsableBuiltins.length > 0) {
    console.log('Unparsable function names:', unparsableBuiltins.map((b) => b.name).join(', '));
  }

  await writeBuiltinsFromTemplate(JS_SRC, JS_DEST, { allBuiltins: builtins, unparsableBuiltins });
}

run().catch((err) => {
  console.error('Failed to compile built-ins', err);

  process.exit(1);
});
