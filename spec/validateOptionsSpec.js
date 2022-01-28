/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
  _validateOptions
} = require('../src/excel-as-json');

// TODO: How to get chai defined in a more global way
const chai = require('chai');
chai.should();
const {
  expect
} = chai;

const TEST_OPTIONS = {
  sheet: '1',
  isColOriented: false,
  omitEmptyFields: false
};

describe('validate options', function() {

  it('should provide default options when none are specified', function(done) {
    let options = _validateOptions(null);
    options.sheet.should.equal(1);
    options.isColOriented.should.equal(false);
    options.omitEmptyFields.should.equal(false);

    options = _validateOptions(undefined);
    options.sheet.should.equal(1);
    options.isColOriented.should.equal(false);
    options.omitEmptyFields.should.equal(false);
    return done();
  });


  it('should fill in missing sheet id', function(done) {
    const o = {
      isColOriented: false,
      omitEmptyFields: false
    };

    const options = _validateOptions(o);
    options.sheet.should.equal(1);
    options.isColOriented.should.equal(false);
    options.omitEmptyFields.should.equal(false);
    return done();
  });


  it('should fill in missing isColOriented', function(done) {
    const o = {
      sheet: '1',
      omitEmptyFields: false
    };

    const options = _validateOptions(o);
    options.sheet.should.equal(1);
    options.isColOriented.should.equal(false);
    options.omitEmptyFields.should.equal(false);
    return done();
  });


  it('should fill in missing omitEmptyFields', function(done) {
    const o = {
      sheet: '1',
      isColOriented: false
    };

    const options = _validateOptions(o);
    options.sheet.should.equal(1);
    options.isColOriented.should.equal(false);
    options.omitEmptyFields.should.equal(false);
    return done();
  });


  it('should convert a numeric sheet id to text', function(done) {
    const o = {
      sheet: 3,
      isColOriented: false,
      omitEmptyFields: true
    };

    const options = _validateOptions(o);
    options.sheet.should.equal(3);
    options.isColOriented.should.equal(false);
    options.omitEmptyFields.should.equal(true);
    return done();
  });


  return it('should detect invalid sheet ids and replace with the default', function(done) {
    const o = {
      sheet: '-1',
      isColOriented: false,
      omitEmptyFields: true
    };

    let options = _validateOptions(o);
    options.sheet.should.equal(1);
    options.isColOriented.should.equal(false);
    options.omitEmptyFields.should.equal(true);

    o.sheet = -1;
    options = _validateOptions(o);
    options.sheet.should.equal(1);

    o.sheet = true;
    options = _validateOptions(o);
    options.sheet.should.equal(1);

    o.sheet = isNaN;
    options = _validateOptions(o);
    options.sheet.should.equal(1);
    return done();
  });
});
