import camundaTags from './camunda.json';

import { parseBuiltins } from './util';

export const camundaBuiltins = parseBuiltins(camundaTags);