import { expect } from 'chai';

import { camundaBuiltins, feelBuiltins, camundaExtensions, unparsableBuiltins } from '@camunda/feel-builtins';


describe('lib/camundaBuiltins', function() {

  it('should export ALL built-ins', function() {

    // then
    expect(camundaBuiltins).to.be.an('array').with.length(135);
  });


  it('should export feelBuiltins', function() {

    // then
    expect(feelBuiltins).to.be.an('array');
    expect(feelBuiltins.length).to.be.greaterThan(0);

    // standard FEEL function should be in feelBuiltins
    const notFunction = feelBuiltins.find(b => b.name === 'not');
    expect(notFunction).to.exist;
  });


  it('should export camundaExtensions', function() {

    // then
    expect(camundaExtensions).to.be.an('array');
    expect(camundaExtensions.length).to.be.greaterThan(0);

    // Camunda extension should be in camundaExtensions
    const getOrElse = camundaExtensions.find(b => b.name === 'get or else');
    expect(getOrElse).to.exist;
  });


  it('should compute camundaBuiltins from feelBuiltins and camundaExtensions', function() {

    // then
    expect(camundaBuiltins.length).to.equal(feelBuiltins.length + camundaExtensions.length);
  });


  it('should export unparsableBuiltins', function() {

    // then
    expect(unparsableBuiltins).to.be.an('array').with.length(1);
    expect(unparsableBuiltins[0].name).to.equal('get or else');
  });


  it('should export parameterized built-in', function() {

    // then
    expectBuiltin('get or else', {
      name: 'get or else',
      type: 'function',
      params: [ { name: 'value' }, { name: 'default' } ],
    });
  });


  it('should export parameterless built-in', function() {

    // then
    expectBuiltin('random number', {
      name: 'random number',
      type: 'function',
      params: []
    });
  });

});


// helpers /////////

/**
 * @param {string} name
 *
 * @return {import('@camunda/feel-builtins').Builtin}
 */
function findBuiltin(name) {
  const builtin = camundaBuiltins.find(builtin => builtin.name === name);

  if (!builtin) {
    throw expect(builtin, `builtin with name <${name}>`).to.exist;
  }

  return builtin;
}

/**
 * @param {string} name
 * @param {Record<string, any>} expectedProperties
 */
function expectBuiltin(name, expectedProperties) {
  const builtin = findBuiltin(name);

  expect(builtin).to.deep.include(expectedProperties);
  expect(builtin).to.have.property('info');
}