import { expect } from 'chai';

import { resolveDocLink } from '../../../../tasks/utils/markdownParser.js';


describe('tasks/markdownParser', function() {

  describe('resolveDocLink', function() {

    const fileRelPath = 'docs/components/modeler/feel/builtin-functions/feel-built-in-functions-context.md';


    it('should leave absolute https links unchanged', function() {

      // when
      const href = resolveDocLink('https://json-schema.org/', fileRelPath);

      // then
      expect(href).to.eql('https://json-schema.org/');
    });


    it('should resolve a pure same-page anchor against the current file', function() {

      // when
      const href = resolveDocLink('#get-entriescontext', fileRelPath);

      // then
      expect(href).to.eql(
        'https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-context/#get-entriescontext'
      );
    });


    it('should resolve a same-directory relative link with an anchor', function() {

      // when
      const href = resolveDocLink('feel-built-in-functions-context.md#get-entriescontext', fileRelPath);

      // then
      expect(href).to.eql(
        'https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-context/#get-entriescontext'
      );
    });


    it('should resolve a multi-level relative link', function() {

      // when
      const href = resolveDocLink(
        '../../../connectors/out-of-the-box-connectors/agentic-ai-aiagent.md',
        fileRelPath
      );

      // then
      expect(href).to.eql(
        'https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent'
      );
    });

  });

});
