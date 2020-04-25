/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
  processFile
} = require('../src/excel-as-json');
const fs = require('fs');

// TODO: How to get chai defined in a more global way
const chai = require('chai');
chai.should();
const {
  expect
} = chai;

// Test constants
const RGR_SRC_XLSX = 'data/regression.xlsx';

const RGR23_SHEET = 1;
const RGR23_IS_COL_ORIENTED = true;
const RGR23_OUT_JSON = 'build/rgr23.json';

const RGR28_SHEET = 2;
const RGR28_IS_COL_ORIENTED = false;
const RGR28_OUT_JSON = 'build/rgr28.json';

describe('regression 23', function() {

  it('should produce empty arrays for flat arrays without values', function(done) {
    const options = {
      sheet: RGR23_SHEET,
      isColOriented: RGR23_IS_COL_ORIENTED,
      omitEmptyFields: false
    };

    return processFile(RGR_SRC_XLSX, RGR23_OUT_JSON, options, function(err, data) {
      expect(err).to.be.an('undefined');
      expect(data[0]).to.have.property('emptyArray').with.lengthOf(0);
      return done();
    });
  });

  return it('should remove flat arrays when omitEmptyFields and value list is blank', function(done) {
    const options = {
      sheet: RGR23_SHEET,
      isColOriented: RGR23_IS_COL_ORIENTED,
      omitEmptyFields: true
    };

    return processFile(RGR_SRC_XLSX, RGR23_OUT_JSON, options, function(err, data) {
      expect(err).to.be.an('undefined');
      expect(data[0].emptyArray).to.be.an('undefined');
      return done();
    });
  });
});


describe('regression 28', () => it('should produce an empty array when no value rows are provided', function(done) {
  const options = {
    sheet: RGR28_SHEET,
    isColOriented: RGR28_IS_COL_ORIENTED,
    omitEmptyFields: false
  };

  return processFile(RGR_SRC_XLSX, RGR28_OUT_JSON, options, function(err, data) {
    expect(err).to.be.an('undefined');
    expect(data).to.be.an('array').with.lengthOf(0);
    return done();
  });
}));

