/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
  convert
} = require('../src/excel-as-json');

// TODO: How to get chai defined in a more global way
const chai = require('chai');
chai.should();
const {
  expect
} = chai;

const DEFAULT_OPTIONS = {
  isColOriented: false,
  omitEmptyFields: false,
  convertTextToNumber: true
};

describe('convert', function() {

  it('should convert a row to a list of object', function() {
    const data = [
      ['a', 'b', 'c'  ],
      [ 1,   2,  'true' ]];
    const result = convert(data, DEFAULT_OPTIONS);
    return JSON.stringify(result).should.equal('[{"a":1,"b":2,"c":true}]');
  });


  it('should convert rows to a list of objects', function() {
    const data = [
      ['a', 'b', 'c'],
      [ 1,   2,   3 ],
      [ 4,   5,   6 ]];
    const result = convert(data, DEFAULT_OPTIONS);
    return JSON.stringify(result).should.equal('[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]');
  });


  it('should convert rows to a list of objects, omitting empty values', function() {
    const o = {
      isColOriented: false,
      omitEmptyFields: true
    };
    const data = [
      ['a', 'b', 'c'],
      [ 1,   '',   3 ],
      [ '',   5,   6 ],
      [ '',   5,   '' ]];
    const result = convert(data, o);
    return JSON.stringify(result).should.equal('[{"a":1,"c":3},{"b":5,"c":6},{"b":5}]');
  });


  it('should convert a column to list of object', function() {
    const o = {
      isColOriented: true,
      omitEmptyFields: false
    };
    const data = [['a', 1],
            ['b', 2],
            ['c', 3]];
    const result = convert(data, o);
    return JSON.stringify(result).should.equal('[{"a":1,"b":2,"c":3}]');
  });


  it('should convert columns to list of objects', function() {
    const o = {
      isColOriented: true,
      omitEmptyFields: false
    };
    const data = [['a', 1, 4 ],
            ['b', 2, 5 ],
            ['c', 3, 6 ]];
    const result = convert(data, o);
    return JSON.stringify(result).should.equal('[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]');
  });


  it('should understand dotted key paths with 2 elements', function() {
    const data = [
      ['a', 'b.a', 'b.b'],
      [ 1,    2,     3  ],
      [ 4,    5,     6  ]];
    const result = convert(data, DEFAULT_OPTIONS);
    return JSON.stringify(result).should.equal('[{"a":1,"b":{"a":2,"b":3}},{"a":4,"b":{"a":5,"b":6}}]');
  });


  it('should understand dotted key paths with 2 elements and omit elements appropriately', function() {
    const o = {
      isColOriented: false,
      omitEmptyFields: true
    };
    const data = [
      ['a', 'b.a', 'b.b'],
      [ 1,    2,     3  ],
      [ '',   5,     '' ]];
    const result = convert(data, o);
    return JSON.stringify(result).should.equal('[{"a":1,"b":{"a":2,"b":3}},{"b":{"a":5}}]');
  });


  it('should understand dotted key paths with 3 elements', function() {
    const data = [['a', 'b.a.b', 'c'],
            [ 1,     2,     3 ],
            [ 4,     5,     6 ]];
    const result = convert(data, DEFAULT_OPTIONS);
    return JSON.stringify(result).should.equal('[{"a":1,"b":{"a":{"b":2}},"c":3},{"a":4,"b":{"a":{"b":5}},"c":6}]');
  });


  it('should understand indexed arrays in dotted paths', function() {
    const data = [['a[0].a', 'b.a.b', 'c'],
            [   1,        2,     3 ],
            [   4,        5,     6 ]];
    const result = convert(data, DEFAULT_OPTIONS);
    return JSON.stringify(result).should.equal('[{"a":[{"a":1}],"b":{"a":{"b":2}},"c":3},{"a":[{"a":4}],"b":{"a":{"b":5}},"c":6}]');
  });


  it('should understand indexed arrays in dotted paths', function() {
    const data = [['a[0].a', 'a[0].b', 'c'],
            [   1,        2,      3 ],
            [   4,        5,      6 ]];
    const result = convert(data, DEFAULT_OPTIONS);
    return JSON.stringify(result).should.equal('[{"a":[{"a":1,"b":2}],"c":3},{"a":[{"a":4,"b":5}],"c":6}]');
  });


  it('should understand indexed arrays when out of order', function() {
    const data = [['a[1].a', 'a[0].a', 'c'],
            [   1,        2,      3 ],
            [   4,        5,      6 ]];
    const result = convert(data, DEFAULT_OPTIONS);
    return JSON.stringify(result).should.equal('[{"a":[{"a":2},{"a":1}],"c":3},{"a":[{"a":5},{"a":4}],"c":6}]');
  });


  it('should understand indexed arrays in deep dotted paths', function() {
    const data = [['a[0].a', 'b.a[0].b', 'c.a.b[0].d'],
            [   1,         2,           3      ],
            [   4,         5,           6      ]];
    const result = convert(data, DEFAULT_OPTIONS);
    return JSON.stringify(result).should.equal('[{"a":[{"a":1}],"b":{"a":[{"b":2}]},"c":{"a":{"b":[{"d":3}]}}},{"a":[{"a":4}],"b":{"a":[{"b":5}]},"c":{"a":{"b":[{"d":6}]}}}]');
  });


  it('should understand flat arrays as terminal key names', function() {
    const data = [['a[]', 'b.a[]', 'c.a.b[]'],
            ['a;b',  'c;d',    'e;f'  ],
            ['g;h',  'i;j',    'k;l'  ]];
    const result = convert(data, DEFAULT_OPTIONS);
    return JSON.stringify(result).should.equal('[{"a":["a","b"],"b":{"a":["c","d"]},"c":{"a":{"b":["e","f"]}}},{"a":["g","h"],"b":{"a":["i","j"]},"c":{"a":{"b":["k","l"]}}}]');
  });


  it('should convert text to numbers where appropriate', function() {
    const data = [[  'a',   'b',    'c'  ],
            [ '-99', 'test', '2e64']];
    const result = convert(data, DEFAULT_OPTIONS);
    return JSON.stringify(result).should.equal('[{"a":-99,"b":"test","c":2e+64}]');
  });


  it('should not convert text that looks like numbers to numbers when directed', function() {
    const o =
      {convertTextToNumber: false};

    const data = [[  'a',   'b',    'c',    ],
            [ '-99', '00938', '02e64' ]];
    const result = convert(data, o);
    result[0].should.have.property('a', '-99');
    result[0].should.have.property('b', '00938');
    return result[0].should.have.property('c', '02e64');
  });


  return it('should not convert numbers to text when convertTextToNumber = false', function() {
    const o =
      {convertTextToNumber: false};

    const data = [[  'a', 'b', 'c',  'd' ],
            [ -99,  938, 2e64, 0x4aa ]];
    const result = convert(data, o);
    result[0].should.have.property('a', -99);
    result[0].should.have.property('b', 938);
    result[0].should.have.property('c', 2e+64);
    return result[0].should.have.property('d', 1194);
  });
});

