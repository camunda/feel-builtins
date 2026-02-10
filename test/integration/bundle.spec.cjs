const { camundaBuiltins } = require('@camunda/feel-builtins');

const { expect } = require('chai');


describe('integration - bundle', function() {

  it('should export CJS export', async function() {

    // then
    expect(camundaBuiltins).not.to.be.empty;
  });

});