import { glob } from 'glob';
import { readFile } from 'node:fs/promises';
import { categorizeBuiltins, logStatistics, parseBuiltins, parseMarkdownFile, writeBuiltinsFromTemplate } from './utils/index.js';

// paths relative to CWD
const MARKDOWN_SRC = './camunda-docs/docs/components/modeler/feel/builtin-functions/*.md';
const VERSIONED_MARKDOWN_SRC = './camunda-docs/versioned_docs/version-*/components/modeler/feel/builtin-functions/*.md';
const DOCS_VERSIONS_SRC = './camunda-docs/versions.json';
const JS_SRC = './tasks/camundaBuiltins.template.js';
const JS_DEST = './src/camundaBuiltins.js';

async function run() {
  const currentDocsVersion = await getCurrentDocsVersion();
  const [ files, versionedFiles ] = await Promise.all([
    glob(MARKDOWN_SRC),
    glob(VERSIONED_MARKDOWN_SRC)
  ]);

  const [ descriptors, versionedDescriptors ] = await Promise.all([
    Promise.all(files.sort().map((file) => parseMarkdownFile(file, currentDocsVersion))),
    Promise.all(versionedFiles.sort().map((file) => parseMarkdownFile(file)))
  ]);

  const currentDescriptors = descriptors.flat();
  const builtins = parseBuiltins(currentDescriptors, [ ...currentDescriptors, ...versionedDescriptors.flat() ]);

  // Categorize into FEEL builtins and Camunda extensions
  const categorized = categorizeBuiltins(builtins);

  logStatistics(categorized);

  await writeBuiltinsFromTemplate(JS_SRC, JS_DEST, categorized);
}

run().catch((err) => {
  console.error('Failed to compile built-ins', err);

  process.exit(1);
});

async function getCurrentDocsVersion() {
  const versions = JSON.parse(await readFile(DOCS_VERSIONS_SRC, 'utf-8'));

  if (!Array.isArray(versions) || !versions.length) {
    throw new Error(`failed to determine current docs version from <${DOCS_VERSIONS_SRC}>`);
  }

  const latestVersion = versions
    .map(parseVersion)
    .sort(compareVersionParts)
    .at(-1);

  if (!latestVersion) {
    throw new Error(`failed to parse versions from <${DOCS_VERSIONS_SRC}>`);
  }

  return `${latestVersion[0]}.${latestVersion[1] + 1}`;
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(`failed to parse docs version <${version}>`);
  }

  return [ Number(match[1]), Number(match[2]) ];
}

function compareVersionParts(left, right) {
  return left[0] - right[0] || left[1] - right[1];
}
