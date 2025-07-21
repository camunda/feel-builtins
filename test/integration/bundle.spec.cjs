const { camundaBuiltins } = require('@camunda/feel-builtins');


describe('integration - bundle', function() {

  it('should export CJS export', async function() {

    const { expect } = await import('chai');

    // then
    expect(camundaBuiltins).not.to.be.empty;
  });

});