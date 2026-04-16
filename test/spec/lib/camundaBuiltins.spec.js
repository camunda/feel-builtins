import { expect } from 'chai';

import {
  camundaBuiltins,
  feelBuiltins,
  camundaExtensions,
  camundaReservedNameBuiltins
} from '@camunda/feel-builtins';


describe('camundaBuiltins', function() {

  it('should export ALL builtins', function() {

    // testing if the count of builtin changes, if it does we have
    // to adjust from chore to feat and do a minor release

    // then
    expect(camundaBuiltins).to.be.an('array').with.length(135);
    expect(camundaReservedNameBuiltins).to.be.an('array').with.length(1);
  });


  it('should export feelBuiltins', function() {

    // then
    expectBuiltin(feelBuiltins, 'not');
  });


  it('should export camundaExtensions', function() {

    // then
    expectBuiltin(camundaExtensions, 'get or else');
  });


  it('should export camundaReservedNameBuiltins', function() {

    // then
    expectBuiltin(camundaReservedNameBuiltins, 'get or else');
  });


  it('should export camundaBuiltins', function() {

    // then
    expect(camundaBuiltins).to.have.length(feelBuiltins.length + camundaExtensions.length);
  });


  it('should export parameterized builtin', function() {

    // then
    expectBuiltinProperties(camundaBuiltins, 'get or else', {
      name: 'get or else',
      type: 'function',
      params: [ { name: 'value' }, { name: 'default' } ],
    });
  });


  it('should export parameterless builtin', function() {

    // then
    expectBuiltinProperties(camundaBuiltins, 'random number', {
      name: 'random number',
      type: 'function',
      params: []
    });
  });

});


// helpers /////////

/**
 * @param {import('@camunda/feel-builtins').Builtin[]} builtins
 * @param {string} name
 *
 * @return {import('@camunda/feel-builtins').Builtin}
 */
function expectBuiltin(builtins, name) {
  const builtin = builtins.find(builtin => builtin.name === name);

  if (!builtin) {
    throw expect(builtin, `builtin with name <${name}>`).to.exist;
  }

  return builtin;
}

/**
 * @param {import('@camunda/feel-builtins').Builtin[]} builtins
 * @param {string} name
 *
 * @param {Record<string, any>} expectedProperties
 */
function expectBuiltinProperties(builtins, name, expectedProperties) {
  const builtin = expectBuiltin(builtins, name);

  expect(builtin).to.deep.include(expectedProperties);
  expect(builtin).to.have.property('info');
}