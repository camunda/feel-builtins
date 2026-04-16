import { expect } from 'chai';

import { parseBuiltin, parseBuiltins } from '../../../../tasks/utils/parseBuiltins.js';


describe('tasks/parseBuiltins', function() {

  it('should parse parameters correctly', function() {

    // given
    const descriptor = {
      name: 'get or else(value, default)',
      engine: '8.6',
      description:
        '<p><em>Camunda Extension</em></p>\n<p>Return the provided value parameter if not <code>null</code>, otherwise return the default parameter</p>\n<p><strong>Function signature</strong></p>\n<pre><code class="language-feel">get or else(value: Any, default: Any): Any\n</code></pre>\n<p><strong>Examples</strong></p>\n<pre><code class="language-feel">get or else(&quot;this&quot;, &quot;default&quot;)\n// &quot;this&quot;\n\nget or else(null, &quot;default&quot;)\n// &quot;default&quot;\n\nget or else(null, null)\n// null\n</code></pre>\n',
    };

    // when
    const builtin = parseBuiltin(descriptor);

    // then
    expect(builtin).to.eql({
      name: 'get or else',
      engines: {
        camunda: '>=8.6'
      },
      info: descriptor.description,
      type: 'function',
      params: [
        {
          name: 'value',
        },
        {
          name: 'default',
        },
      ],
    });
  });


  it('should parse parameterless functions', function() {

    // given
    const descriptor = {
      name: 'random number()',
      engine: '8.7',
      description:
        '<p><em>Camunda Extension</em></p>\n<p>Returns a random number between <code>0</code> and <code>1</code>.</p>\n<p><strong>Function signature</strong></p>\n<pre><code class="language-feel">random number(): number\n</code></pre>\n<p><strong>Examples</strong></p>\n<pre><code class="language-feel">random number()\n// 0.9701618132579795\n</code></pre>\n',
    };

    // when
    const builtin = parseBuiltin(descriptor);

    // then
    expect(builtin).to.eql({
      name: 'random number',
      engines: {
        camunda: '>=8.7'
      },
      info: descriptor.description,
      type: 'function',
      params: [],
    });
  });


  it('should use the first supported engine version', function() {

    // given
    const currentDescriptors = [ {
      name: 'fromAi(value)',
      engine: '8.9',
      description: '<p><em>Camunda Extension</em></p>'
    } ];
    const allDescriptors = [
      ...currentDescriptors,
      {
        name: 'fromAi(value)',
        engine: '8.8',
        description: '<p><em>Camunda Extension</em></p>'
      }
    ];

    // when
    const [ builtin ] = parseBuiltins(currentDescriptors, allDescriptors);

    // then
    expect(builtin).to.deep.include({
      name: 'fromAi',
      engines: {
        camunda: '>=8.8'
      }
    });
  });

});
