import { camundaBuiltins } from '../../src/builtins/index.js';
import { createContext } from '../../src/language/index.js';


describe ('createContext',function() {

  it('should work',function() {

    const context = (createContext(camundaBuiltins));
    expect(Object.keys(context).lentth).to.be.equal(context.length);
  });

});
