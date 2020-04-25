/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
  parseKeyName
} = require('../src/excel-as-json');

// TODO: How to get chai defined in a more global way
const chai = require('chai');
chai.should();
const {
  expect
} = chai;


describe('parse key name', function() {

  it('should parse simple key names', function() {
    const [keyIsList, keyName, index] = Array.from(parseKeyName('names'));
    keyIsList.should.equal(false);
    keyName.should.equal('names');
    return expect(index).to.be.an('undefined');
  });


  it('should parse indexed array key names like names[1]', function() {
    const [keyIsList, keyName, index] = Array.from(parseKeyName('names[1]'));
    keyIsList.should.equal(true);
    keyName.should.equal('names');
    return index.should.equal(1);
  });


  return it('should parse array key names like names[]', function() {
    const [keyIsList, keyName, index] = Array.from(parseKeyName('names[]'));
    keyIsList.should.equal(true);
    keyName.should.equal('names');
    return expect(index).to.be.an('undefined');
  });
});


