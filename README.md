
# Camunda FEEL Builtins

Collection of builtin Camunda extensions for FEEL (Friendly Enough Expression Language). These builtins get extracted from [camunda-docs](https://github.com/camunda/camunda-docs/tree/main/docs/components/modeler/feel/builtin-functions).

## Installation

Install via npm:

```sh
npm install @camunda/feel-builtins
```

## Usage

You can use the builtins in your FEEL editor by importing them from this package. Here's an example of how to integrate them into a FEEL editor instance:

```js
import { camundaBuiltins } from '@camunda/feel-builtins';
import FeelEditor from '@bpmn-io/feel-editor';

const editor = new FeelEditor({
  container,
  builtins: camundaBuiltins
});
```

## Resources

- [Changelog](./CHANGELOG.md)
- [Issues](https://github.com/camunda/feel-builtins/issues)

## Build and Run

Install dependencies:

```sh
npm install
```

Update camunda builtins
```sh
npm run builtins # pulls camunda-docs and extracts builtins
```

Build the project:

```sh
npm run build
```

## Related

- [@bpmn-io/feel-editor](https://github.com/bpmn-io/feel-editor): FEEL editor and playground

## License

[MIT](./LICENSE)