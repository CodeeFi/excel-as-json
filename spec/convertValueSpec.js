/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
  convertValue
} = require('../src/excel-as-json');

// TODO: How to get chai defined in a more global way
const chai = require('chai');
chai.should();
const {
  expect
} = chai;

const OPTIONS = {
  sheet: '1',
  isColOriented: false,
  omitEmptyFields: false,
  omitKeysWithEmptyValues: false,
  convertTextToNumber: true
};

const MAPPING_OPTIONS = {
  sheet: '1',
  isColOriented: false,
  omitEmptyFields: false,
  omitKeysWithEmptyValues: false,
  columnMapping: {
    numberValue: {type: "number"},
    booleanValue: {type: "boolean"}
  }
};


describe('convert value', function() {

  it('should convert text integers to literal numbers', function() {
    convertValue('1000', OPTIONS).should.be.a('number').and.equal(1000);
    return convertValue('-999', OPTIONS).should.be.a('number').and.equal(-999);
  });


  it('should convert text floats to literal numbers', function() {
    convertValue('999.0', OPTIONS).should.be.a('number').and.equal(999.0);
    return convertValue('-100.0', OPTIONS).should.be.a('number').and.equal(-100.0);
  });


  it('should convert text exponential numbers to literal numbers', () => convertValue('2e32', OPTIONS).should.be.a('number').and.equal(2e+32));


  it('should not convert things that are not numbers', () => convertValue('test', OPTIONS).should.be.a('string').and.equal('test'));


  it('should convert true and false to Boolean', function() {
    convertValue('true', OPTIONS).should.be.a('boolean').and.equal(true);
    convertValue('TRUE', OPTIONS).should.be.a('boolean').and.equal(true);
    convertValue('TrUe', OPTIONS).should.be.a('boolean').and.equal(true);
    convertValue('false', OPTIONS).should.be.a('boolean').and.equal(false);
    convertValue('FALSE', OPTIONS).should.be.a('boolean').and.equal(false);
    return convertValue('fAlSe', OPTIONS).should.be.a('boolean').and.equal(false);
  });


  it('should return blank strings as strings', function() {
    convertValue('', OPTIONS).should.be.a('string').and.equal('');
    return convertValue(' ', OPTIONS).should.be.a('string').and.equal(' ');
  });


  it('should treat text that looks like numbers as text when directed', function() {
    const o =
      {convertTextToNumber: false};

    convertValue('999.0', o).should.be.a('string').and.equal('999.0');
    convertValue('-100.0', o).should.be.a('string').and.equal('-100.0');
    convertValue('2e32', o).should.be.a('string').and.equal('2e32');
    return convertValue('00956', o).should.be.a('string').and.equal('00956');
  });


  return it('should not convert numbers to text when convertTextToNumber = false', function() {
    const o =
      {convertTextToNumber: false};

    convertValue(999.0, o).should.be.a('number').and.equal(999.0);
    convertValue(-100.0, o).should.be.a('number').and.equal(-100.0);
    convertValue(2e+32, o).should.be.a('number').and.equal(2e+32);
    convertValue(956, o).should.be.a('number').and.equal(956);
    return convertValue(0x4aa, o).should.be.a('number').and.equal(1194);
  });

});

describe('convert value mapping', function() {
  it('should convert to integers', function() {
    convertValue('1000', MAPPING_OPTIONS, "numberValue").should.be.a('number').and.equal(1000);
    return convertValue('-999', MAPPING_OPTIONS, "numberValue").should.be.a('number').and.equal(-999);
  });


  it('should convert text floats to literal numbers', function() {
    convertValue('999.0', MAPPING_OPTIONS, "numberValue").should.be.a('number').and.equal(999.0);
    return convertValue('-100.0', MAPPING_OPTIONS, "numberValue").should.be.a('number').and.equal(-100.0);
  });


  it('should convert text exponential numbers to literal numbers', () => convertValue('2e32', MAPPING_OPTIONS, "numberValue").should.be.a('number').and.equal(2e+32));


  it('should not convert things that are not numbers', () => expect(() => convertValue('test', MAPPING_OPTIONS, "numberValue")).to.throw("Cannot convert \"test\" to number"));

  it('should convert true and false to Boolean', function() {
    convertValue('true', MAPPING_OPTIONS, "booleanValue").should.be.a('boolean').and.equal(true);
    convertValue('TRUE', MAPPING_OPTIONS, "booleanValue").should.be.a('boolean').and.equal(true);
    convertValue('TrUe', MAPPING_OPTIONS, "booleanValue").should.be.a('boolean').and.equal(true);
    convertValue('false', MAPPING_OPTIONS, "booleanValue").should.be.a('boolean').and.equal(false);
    convertValue('FALSE', MAPPING_OPTIONS, "booleanValue").should.be.a('boolean').and.equal(false);
    return convertValue('fAlSe', MAPPING_OPTIONS,"booleanValue").should.be.a('boolean').and.equal(false);
  });

});

