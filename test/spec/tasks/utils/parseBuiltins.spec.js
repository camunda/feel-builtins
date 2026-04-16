import { expect } from 'chai';

import { parseBuiltin } from '../../../../tasks/utils/parseBuiltins.js';


describe('tasks/parseBuiltins', function() {

  it('should parse parameters correctly', function() {

    // given
    const descriptor = {
      name: 'get or else(value, default)',
      description:
        '<p><em>Camunda Extension</em></p>\n<p>Return the provided value parameter if not <code>null</code>, otherwise return the default parameter</p>\n<p><strong>Function signature</strong></p>\n<pre><code class="language-feel">get or else(value: Any, default: Any): Any\n</code></pre>\n<p><strong>Examples</strong></p>\n<pre><code class="language-feel">get or else(&quot;this&quot;, &quot;default&quot;)\n// &quot;this&quot;\n\nget or else(null, &quot;default&quot;)\n// &quot;default&quot;\n\nget or else(null, null)\n// null\n</code></pre>\n',
    };

    // when
    const builtin = parseBuiltin(descriptor);

    // then
    expect(builtin).to.eql({
      name: 'get or else',
      info: descriptor.description,
      type: 'function',
      params: [
        {
          name: 'value',
          type: 'Any'
        },
        {
          name: 'default',
          type: 'Any'
        },
      ],
      return: {
        type: 'Any'
      }
    });
  });


  it('should parse parameterless functions', function() {

    // given
    const descriptor = {
      name: 'random number()',
      description:
        '<p><em>Camunda Extension</em></p>\n<p>Returns a random number between <code>0</code> and <code>1</code>.</p>\n<p><strong>Function signature</strong></p>\n<pre><code class="language-feel">random number(): number\n</code></pre>\n<p><strong>Examples</strong></p>\n<pre><code class="language-feel">random number()\n// 0.9701618132579795\n</code></pre>\n',
    };

    // when
    const builtin = parseBuiltin(descriptor);

    // then
    expect(builtin).to.eql({
      name: 'random number',
      info: descriptor.description,
      type: 'function',
      params: [],
      return: {
        type: 'number'
      }
    });
  });


  it('should merge overload parameter types', function() {

    // given
    const descriptor = {
      name: 'date(from)',
      description:
        '<p>Returns a date from the given value.</p>\n<p><strong>Function signature</strong></p>\n<pre><code class="language-feel">date(from: string): date\n</code></pre>\n<p>Parses the given string into a date.</p>\n<pre><code class="language-feel">date(from: date and time): date\n</code></pre>\n<p><strong>Examples</strong></p>\n<pre><code class="language-feel">date("2018-04-29")\n// date("2018-04-29")\n</code></pre>\n',
    };

    // when
    const builtin = parseBuiltin(descriptor);

    // then
    expect(builtin).to.eql({
      name: 'date',
      info: descriptor.description,
      type: 'function',
      params: [
        {
          name: 'from',
          type: 'string | date and time'
        }
      ],
      return: {
        type: 'date'
      }
    });
  });


  it('should fallback to the first parameter type when the return type is omitted', function() {

    // given
    const descriptor = {
      name: 'assert(value, condition)',
      description:
        '<p><em>Camunda Extension</em></p>\n<p><strong>Function signature</strong></p>\n<pre><code class="language-feel">assert(value: Any, condition: Any)\n</code></pre>\n<p><strong>Examples</strong></p>\n<pre><code class="language-feel">assert(x, x != null)\n// "value"\n</code></pre>\n',
    };

    // when
    const builtin = parseBuiltin(descriptor);

    // then
    expect(builtin).to.eql({
      name: 'assert',
      info: descriptor.description,
      type: 'function',
      params: [
        {
          name: 'value',
          type: 'Any'
        },
        {
          name: 'condition',
          type: 'Any'
        }
      ],
      return: {
        type: 'Any'
      }
    });
  });

});
