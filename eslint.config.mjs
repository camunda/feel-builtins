import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const files = {
  ignored: [
    'dist',
    'camunda-docs'
  ],
  build: [
    '*.js',
    '*.mjs'
  ]
};

export default [
  {
    ignores: files.ignored
  },

  ...bpmnIoPlugin.configs.node.map(config => {

    return {
      ...config,
      files: files.build
    };
  })
];