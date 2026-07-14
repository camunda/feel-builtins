import { Marked } from 'marked';
import { readFile } from 'node:fs/promises';

const DOCS_BASE_URL = 'https://docs.camunda.io';

/**
 * @typedef { { name: string, description: string } } BuiltinDescriptor
 */

/**
 * Rewrite a markdown link href so it resolves outside of the docs.camunda.io
 * site (e.g. as a tooltip in an editor). Absolute URLs (any origin other than
 * docs.camunda.io) are left untouched; relative paths and same-page anchors
 * are resolved against the source file's location in the camunda-docs repo
 * and turned into an absolute docs.camunda.io URL.
 *
 * @param {string} href
 * @param {string} fileRelPath path of the source file relative to the camunda-docs repo root, e.g. "docs/components/modeler/feel/builtin-functions/foo.md"
 * @return {string}
 */
export function resolveDocLink(href, fileRelPath) {
  const base = new URL(`${DOCS_BASE_URL}/${fileRelPath}`);
  const resolved = new URL(href, base);

  if (resolved.origin !== base.origin) {
    return resolved.href;
  }

  resolved.pathname = resolved.pathname.replace(/\.md$/, '');

  return resolved.href;
}

/**
 * Parse a markdown file to extract builtin function descriptors
 * @param {string} fileName
 * @return {Promise<BuiltinDescriptor[]>}
 */
export async function parseMarkdownFile(fileName) {
  const fileContent = await readFile(fileName, 'utf-8');

  // camunda-docs is cloned into ./camunda-docs; keep the path from "docs/" onwards
  const fileRelPath = fileName.replace(/^.*?camunda-docs\//, '');

  const marked = new Marked({
    renderer: {

      // mutate the token and defer to the default renderer (returning false falls through to it)
      link(token) {
        token.href = resolveDocLink(token.href, fileRelPath);

        return false;
      },
    },
  });

  const [ _heading, ...contents ] = fileContent.split('## ');

  const descriptions = await Promise.all(
    contents.flatMap(async (string) => {
      const name = string.split('\n')[0];
      let description = await Promise.resolve(marked.parse(string.split('\n').slice(1).join('\n')));

      description = description.replace('<MarkerCamundaExtension></MarkerCamundaExtension>', '<em>Camunda Extension</em>');

      // e.g. "and() / all()"
      if (name.includes('/')) {
        throw new Error(`unsupported built-in name <${name}>`);
      }

      return { name, description };
    }),
  );

  return descriptions;
}
