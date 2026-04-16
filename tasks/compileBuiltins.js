import { glob } from 'glob';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { categorizeBuiltins, logStatistics, parseBuiltins, parseMarkdownContent, parseMarkdownFile, writeBuiltinsFromTemplate } from './utils/index.js';

// paths relative to CWD
const DOCS_REPOSITORY_PATH = './camunda-docs';
const MARKDOWN_SRC = './camunda-docs/docs/components/modeler/feel/builtin-functions/*.md';
const VERSIONED_MARKDOWN_SRC = './camunda-docs/versioned_docs/version-*/components/modeler/feel/builtin-functions/*.md';
const DOCS_VERSIONS_SRC = './camunda-docs/versions.json';
const JS_SRC = './tasks/camundaBuiltins.template.js';
const JS_DEST = './src/camundaBuiltins.js';
const LEGACY_BRANCH_PREFIX = 'origin/unsupported/';
const LEGACY_VERSION_FLOOR = '8.0';

const execFileAsync = promisify(execFile);

async function run() {
  const { currentDocsVersion, archivedDocsVersions } = await getDocsVersionsMetadata();
  const [ files, versionedFiles, legacyDescriptors ] = await Promise.all([
    glob(MARKDOWN_SRC),
    glob(VERSIONED_MARKDOWN_SRC),
    getLegacyDescriptors(archivedDocsVersions[0])
  ]);

  const [ descriptors, versionedDescriptors ] = await Promise.all([
    Promise.all(files.sort().map((file) => parseMarkdownFile(file, currentDocsVersion))),
    Promise.all(versionedFiles.sort().map((file) => parseMarkdownFile(file)))
  ]);

  const currentDescriptors = descriptors.reduce(flattenDescriptors, []);
  const supportedDescriptors = currentDescriptors
    .concat(versionedDescriptors.reduce(flattenDescriptors, []))
    .concat(legacyDescriptors);
  const builtins = parseBuiltins(currentDescriptors, supportedDescriptors);

  // Categorize into FEEL builtins and Camunda extensions
  const categorized = categorizeBuiltins(builtins);

  logStatistics(categorized);

  await writeBuiltinsFromTemplate(JS_SRC, JS_DEST, categorized);
}

run().catch((err) => {
  console.error('Failed to compile built-ins', err);

  process.exit(1);
});

async function getDocsVersionsMetadata() {

  /** @type {string[]} */
  const versions = JSON.parse(await readFile(DOCS_VERSIONS_SRC, 'utf-8'));

  if (!Array.isArray(versions) || !versions.length) {
    throw new Error(`failed to determine current docs version from <${DOCS_VERSIONS_SRC}>`);
  }

  const archivedDocsVersions = versions.slice().sort(compareVersions);
  const latestVersion = archivedDocsVersions[archivedDocsVersions.length - 1];

  if (!latestVersion) {
    throw new Error(`failed to parse versions from <${DOCS_VERSIONS_SRC}>`);
  }

  const [ major, minor ] = parseVersion(latestVersion);

  return {
    archivedDocsVersions,
    currentDocsVersion: `${major}.${minor + 1}`
  };
}

/**
 * @param {string} cutoffVersion
 * @returns {Promise<import('./utils/markdownParser.js').BuiltinDescriptor[]>}
 */
async function getLegacyDescriptors(cutoffVersion) {
  const legacyBranches = await getLegacyBranches(cutoffVersion);
  const descriptors = await Promise.all(legacyBranches.map(loadLegacyBranchDescriptors));

  return descriptors.reduce(flattenDescriptors, []);
}

/**
 * @param {string} cutoffVersion
 * @returns {Promise<Array<{ ref: string, version: string }>>}
 */
async function getLegacyBranches(cutoffVersion) {
  const { stdout } = await execFileAsync(
    'git',
    [ 'for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/unsupported' ],
    { cwd: DOCS_REPOSITORY_PATH }
  );

  return stdout
    .split('\n')
    .map((branch) => branch.trim())
    .filter(Boolean)
    .filter((branch) => branch.startsWith(LEGACY_BRANCH_PREFIX))
    .map((branch) => branch.slice(LEGACY_BRANCH_PREFIX.length))
    .filter(isMinorVersion)
    .filter((version) => compareVersions(version, LEGACY_VERSION_FLOOR) >= 0)
    .filter((version) => compareVersions(version, cutoffVersion) < 0)
    .sort(compareVersions)
    .map((version) => ({
      ref: `${LEGACY_BRANCH_PREFIX}${version}`,
      version
    }));
}

/**
 * @param {{ ref: string, version: string }} legacyBranch
 * @returns {Promise<import('./utils/markdownParser.js').BuiltinDescriptor[]>}
 */
async function loadLegacyBranchDescriptors({ ref, version }) {
  const basePath = `versioned_docs/version-${version}/components/modeler/feel/builtin-functions`;
  const { stdout } = await execFileAsync(
    'git',
    [ 'ls-tree', '-r', '--name-only', ref, '--', basePath ],
    { cwd: DOCS_REPOSITORY_PATH }
  );

  const filePaths = stdout
    .split('\n')
    .map((
        /** @type {string} */ filePath
    ) => filePath.trim())
    .filter(Boolean)
    .sort();

  const descriptors = await Promise.all(filePaths.map(async (
      /** @type {string} */ filePath
  ) => {
    const content = await readGitFile(ref, filePath);

    return parseMarkdownContent(content, version);
  }));

  return descriptors.reduce(flattenDescriptors, []);
}

/**
 * @param {string} ref
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function readGitFile(ref, filePath) {
  const { stdout } = await execFileAsync(
    'git',
    [ 'show', `${ref}:${filePath}` ],
    { cwd: DOCS_REPOSITORY_PATH, maxBuffer: 10 * 1024 * 1024 }
  );

  return stdout;
}

/**
 * @param {string} version
 * @returns {boolean}
 */
function isMinorVersion(version) {
  return /^(\d+)\.(\d+)$/.test(version);
}

/**
 * @param {string} version
 * @returns {[number, number]}
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(`failed to parse docs version <${version}>`);
  }

  return [ Number(match[1]), Number(match[2]) ];
}

/**
 * @param {string} left
 * @param {string} right
 * @returns {number}
 */
function compareVersions(left, right) {
  return compareVersionParts(parseVersion(left), parseVersion(right));
}

/**
 * @param {[number, number]} left
 * @param {[number, number]} right
 * @returns {number}
 */
function compareVersionParts(left, right) {
  return left[0] - right[0] || left[1] - right[1];
}

/**
 * @param {import('./utils/markdownParser.js').BuiltinDescriptor[]} accumulator
 * @param {import('./utils/markdownParser.js').BuiltinDescriptor[]} descriptors
 */
function flattenDescriptors(accumulator, descriptors) {
  return accumulator.concat(descriptors);
}
