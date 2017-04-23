(function() {
  var assert;

  assert = chai.assert;

  suite('parser', function() {
    setup(function() {
    });
    test('Numbers are parsed correctly', () => {
      original.value = '4';
      $('button').trigger('click');
      console.log(OUTPUT.innerHTML);
      assert.match(OUTPUT.innerHTML, /"type":\s*"NUM"(.|\n)*"value":\s*4/i);
    });
    test('Multiplications are parsed correctly', () => {
      var result = parse('4*2');
      console.log(result);
      assert.deepEqual(result, {type: "*", 
                                left: { type: "NUM", value: 4}, 
                                right: {type: "NUM", value: 2}
      });
    });
    test('Bad expressions throw exceptions', () => {
      assert.throws(() => parse('3 + (4+2))'), /Syntax\s+Error/i);
    });
  });
}).call(this);
