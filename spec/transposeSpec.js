/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
  transpose
} = require('../src/excel-as-json');

// TODO: How to get chai defined in a more global way
const chai = require('chai');
chai.should();
const {
  expect
} = chai;


const _removeDuplicates = function(array) {
  let asc, end;
  let key;
  const set = {};
  for (key = 0, end = array.length-1, asc = 0 <= end; asc ? key <= end : key >= end; asc ? key++ : key--) { set[array[key]] = array[key]; }
  return (() => {
    const result = [];
    for (key in set) {
      result.push(key);
    }
    return result;
  })();
};


describe('transpose', function() {

  const square = [
    ['one', 'two', 'three'],
    ['one', 'two', 'three'],
    ['one', 'two', 'three']
  ];

  const rectangleWide = [
    ['one', 'two', 'three'],
    ['one', 'two', 'three']
  ];

  const rectangleTall = [
    ['one', 'two'],
    ['one', 'two'],
    ['one', 'two']
  ];


  it('should transpose square 2D arrays', function() {
    const result = transpose(square);
    result.length.should.equal(3);

    return (() => {
      const result1 = [];
      for (let row of Array.from(result)) {
        row.length.should.equal(3);
        result1.push(_removeDuplicates(row).length.should.equal(1));
      }
      return result1;
    })();
  });


  it('should transpose wide rectangular 2D arrays', function() {
    const result = transpose(rectangleWide);
    result.length.should.equal(3);

    return (() => {
      const result1 = [];
      for (let row of Array.from(result)) {
        row.length.should.equal(2);
        result1.push(_removeDuplicates(row).length.should.equal(1));
      }
      return result1;
    })();
  });


  return it('should transpose tall rectangular 2D arrays', function() {
    const result = transpose(rectangleTall);
    result.length.should.equal(2);

    return (() => {
      const result1 = [];
      for (let row of Array.from(result)) {
        row.length.should.equal(3);
        result1.push(_removeDuplicates(row).length.should.equal(1));
      }
      return result1;
    })();
  });
});


