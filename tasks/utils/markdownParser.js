import { marked } from 'marked';
import { readFile } from 'node:fs/promises';

/**
 * @typedef { { name: string, description: string, engine?: string } } BuiltinDescriptor
 */

const VERSIONED_DOCS_PATH_PATTERN = /\/versioned_docs\/version-(\d+\.\d+)\//;

/**
 * Parse a markdown file to extract builtin function descriptors
 * @param {string} fileName
 * @param {string} [currentVersion]
 * @return {Promise<BuiltinDescriptor[]>}
 */
export async function parseMarkdownFile(fileName, currentVersion) {
  const fileContent = await readFile(fileName, 'utf-8');
  const engine = inferEngineVersion(fileName, currentVersion);

  const [ _heading, ...contents ] = fileContent.split('## ');

  const descriptions = await Promise.all(
    contents.map(async (
        /** @type {string} */ string
    ) => {
      const name = string.split('\n')[0];
      let description = await Promise.resolve(marked.parse(string.split('\n').slice(1).join('\n')));

      description = description.replace('<MarkerCamundaExtension></MarkerCamundaExtension>', '<em>Camunda Extension</em>');

      // e.g. "and() / all()"
      if (name.includes('/')) {
        throw new Error(`unsupported built-in name <${name}>`);
      }

      return { name, description, engine };
    }),
  );

  return descriptions;
}

/**
 * @param {string} fileName
 * @param {string} [currentVersion]
 * @returns {string|undefined}
 */
function inferEngineVersion(fileName, currentVersion) {
  const versionedDocsMatch = fileName.match(VERSIONED_DOCS_PATH_PATTERN);

  if (versionedDocsMatch) {
    return versionedDocsMatch[1];
  }

  if (fileName.includes('/docs/components/modeler/feel/builtin-functions/')) {
    return currentVersion;
  }
}
