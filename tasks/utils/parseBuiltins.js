/**
 * @param { import('./markdownParser.js').BuiltinDescriptor[] } descriptors
 *
 * @returns {import('@camunda/feel-builtins').Builtin[] }
 */
export function parseBuiltins(descriptors) {
  return descriptors.map(parseBuiltin);
}

/**
 * @param { import('./markdownParser.js').BuiltinDescriptor } descriptor
 *
 * @returns { import('@camunda/feel-builtins').Builtin }
 */
export function parseBuiltin(descriptor) {

  const {
    name,
    description
  } = descriptor;

  const match = name.match(/^([\w\s]+)\((.*)\)$/);

  if (!match) {
    throw new Error(`failed to parse <${name}>`);
  }

  const functionName = match[1];
  const functionArguments = match[2];

  // parameterless function matches as empty string
  const paramNames = functionArguments ? functionArguments.split(', ').map((name) => ({ name })) : [];
  const typeInformation = extractBuiltinTypeInformation(functionName, paramNames, description);

  return {
    name: functionName,
    type: 'function',
    params: typeInformation.params,
    return: typeInformation.return,
    info: description
  };
}

/**
 * @param {string} name
 * @param {{ name: string }[]} params
 * @param {string} info
 *
 * @returns {{ params: Array<{ name: string, type: string }>, return: { type: string } }}
 */
function extractBuiltinTypeInformation(name, params, info) {
  const signatureSection = info.split('<p><strong>Examples</strong></p>')[0];
  const signatureLines = Array.from(signatureSection.matchAll(/<pre><code class="language-feel">([\s\S]*?)<\/code><\/pre>/g))
    .map((match) => decodeHtmlEntities(match[1]).split('\n')[0].trim())
    .filter((line) => line.startsWith(`${name}(`));

  if (!signatureLines.length) {
    throw new Error(`failed to parse signature for <${name}>`);
  }

  const signatures = signatureLines.map(parseSignature);

  return {
    params: params.map((param, index) => ({
      ...param,
      type: joinTypes(signatures.map(({ params }) => params[index]?.type).filter(Boolean))
    })),
    return: {
      type: joinTypes(signatures.map(({ returnType }) => returnType))
    }
  };
}

/**
 * @param {string} signature
 *
 * @returns {{ params: Array<{ name: string, type: string }>, returnType: string }}
 */
function parseSignature(signature) {
  const openIndex = signature.indexOf('(');

  if (openIndex === -1) {
    throw new Error(`failed to parse signature <${signature}>`);
  }

  let depth = 1;
  let closeIndex = -1;

  for (let index = openIndex + 1; index < signature.length; index++) {
    const character = signature[index];

    if (character === '(') {
      depth++;
    } else if (character === ')') {
      depth--;

      if (depth === 0) {
        closeIndex = index;
        break;
      }
    }
  }

  if (closeIndex === -1) {
    throw new Error(`failed to parse signature <${signature}>`);
  }

  const params = splitTopLevel(signature.slice(openIndex + 1, closeIndex), ',').map((entry) => {
    const separatorIndex = entry.indexOf(':');

    if (separatorIndex === -1) {
      throw new Error(`failed to parse parameter <${entry}> in signature <${signature}>`);
    }

    return {
      name: entry.slice(0, separatorIndex).trim(),
      type: entry.slice(separatorIndex + 1).trim()
    };
  });

  const returnType = signature.slice(closeIndex + 1).trim().replace(/^:\s*/, '') || params[0]?.type || 'Any';

  return {
    params,
    returnType
  };
}

/**
 * @param {string} value
 * @param {string} separator
 *
 * @returns {string[]}
 */
function splitTopLevel(value, separator) {
  if (!value) {
    return [];
  }

  const parts = [];
  let current = '';
  let angleDepth = 0;
  let parenDepth = 0;

  for (const character of value) {
    if (character === '<') {
      angleDepth++;
    } else if (character === '>') {
      angleDepth--;
    } else if (character === '(') {
      parenDepth++;
    } else if (character === ')') {
      parenDepth--;
    }

    if (character === separator && !angleDepth && !parenDepth) {
      parts.push(current.trim());
      current = '';

      continue;
    }

    current += character;
  }

  if (current) {
    parts.push(current.trim());
  }

  return parts;
}

/**
 * @param {string[]} types
 *
 * @returns {string}
 */
function joinTypes(types) {
  return [ ...new Set(types) ].join(' | ');
}

/**
 * @param {string} value
 *
 * @returns {string}
 */
function decodeHtmlEntities(value) {
  return value.replace(/&(lt|gt|amp|quot|#39);/g, (match) => {
    switch (match) {
    case '&lt;':
      return '<';
    case '&gt;':
      return '>';
    case '&amp;':
      return '&';
    case '&quot;':
      return '"';
    case '&#39;':
      return '\'';
    default:
      return match;
    }
  });
}
