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

const ROW_XLSX = 'data/row-oriented.xlsx';
const ROW_JSON = 'build/row-oriented.json';
const COL_XLSX = 'data/col-oriented.xlsx';
const COL_JSON = 'build/col-oriented.json';
const COL_JSON_NESTED = 'build/newDir/col-oriented.json';

const ROW_SHEET_1_JSON = '[{"firstName":"Jihad","lastName":"Saladin","address":{"street":"12 Beaver Court","city":"Snowmass","state":"CO","zip":81615}},{"firstName":"Marcus","lastName":"Rivapoli","address":{"street":"16 Vail Rd","city":"Vail","state":"CO","zip":81657}}]';
const ROW_SHEET_2_JSON = '[{"firstName":"Max","lastName":"Irwin","address":{"street":"123 Fake Street","city":"Rochester","state":"NY","zip":99999}}]';
const COL_SHEET_1_JSON = '[{"firstName":"Jihad","lastName":"Saladin","address":{"street":"12 Beaver Court","city":"Snowmass","state":"CO","zip":81615},"isEmployee":true,"phones":[{"type":"home","number":"123.456.7890"},{"type":"work","number":"098.765.4321"}],"aliases":["stormagedden","bob"]},{"firstName":"Marcus","lastName":"Rivapoli","address":{"street":"16 Vail Rd","city":"Vail","state":"CO","zip":81657},"isEmployee":false,"phones":[{"type":"home","number":"123.456.7891"},{"type":"work","number":"098.765.4322"}],"aliases":["mac","markie"]}]';
const COL_SHEET_2_JSON = '[{"firstName":"Max","lastName":"Irwin","address":{"street":"123 Fake Street","city":"Rochester","state":"NY","zip":99999},"isEmployee":false,"phones":[{"type":"home","number":"123.456.7890"},{"type":"work","number":"505-505-1010"}],"aliases":["binarymax","arch"]}]';

const TEST_OPTIONS = {
  sheet: '1',
  isColOriented: false,
  omitEmptyFields: false
};


describe('process file', function() {

  it('should notify on file does not exist', done => processFile('data/doesNotExist.xlsx', null, TEST_OPTIONS, function(err, data) {
    err.should.be.a('string');
    expect(data).to.be.an('undefined');
    return done();
  }));


  it('should not blow up when a file does not exist and no callback is provided', function(done) {
    processFile('data/doesNotExist.xlsx', function() {});
    return done();
  });


  it('should not blow up on read error when no callback is provided', function(done) {
    processFile('data/row-oriented.csv', function() {});
    return done();
  });


  it('should notify on read error', done => processFile('data/row-oriented.csv', null, TEST_OPTIONS, function(err, data) {
    err.should.be.a('string');
    expect(data).to.be.an('undefined');
    return done();
  }));

  it('should process csv file with custom delimiter', done => processFile('data/semicolon-delimiter.csv', null, {csvDelimiter: ";"}, function(err, data) {
    expect(err).to.be.an('undefined');
    JSON.stringify(data).should.equal(ROW_SHEET_1_JSON);
    return done();
  }));


  // NOTE: current excel package impl simply times out if sheet index is OOR
//  it 'should show error on invalid sheet id', (done) ->
//    options =
//      sheet: '20'
//      isColOriented: false
//      omitEmptyFields: false
//
//    processFile ROW_XLSX, null, options, (err, data) ->
//      err.should.be.a 'string'
//      expect(data).to.be.an 'undefined'
//      done()


  it('should use defaults when caller specifies no options', done => processFile(ROW_XLSX, null, null, function(err, data) {
    expect(err).to.be.an('undefined');
    JSON.stringify(data).should.equal(ROW_SHEET_1_JSON);
    return done();
  }));


  it('should process row oriented Excel files, write the result, and return the parsed object', function(done) {
    const options = {
      sheet:'1',
      isColOriented: false,
      omitEmptyFields: false
    };

    return processFile(ROW_XLSX, ROW_JSON, options, function(err, data) {
      expect(err).to.be.an('undefined');
      const result = JSON.parse(fs.readFileSync(ROW_JSON, 'utf8'));
      JSON.stringify(result).should.equal(ROW_SHEET_1_JSON);
      JSON.stringify(data).should.equal(ROW_SHEET_1_JSON);
      return done();
    });
  });


  it('should process sheet 2 of row oriented Excel files, write the result, and return the parsed object', function(done) {
    const options = {
      sheet:'2',
      isColOriented: false,
      omitEmptyFields: false
    };

    return processFile(ROW_XLSX, ROW_JSON, options, function(err, data) {
      expect(err).to.be.an('undefined');
      const result = JSON.parse(fs.readFileSync(ROW_JSON, 'utf8'));
      JSON.stringify(result).should.equal(ROW_SHEET_2_JSON);
      JSON.stringify(data).should.equal(ROW_SHEET_2_JSON);
      return done();
    });
  });


  it('should process col oriented Excel files, write the result, and return the parsed object', function(done) {
    const options = {
      sheet:'1',
      isColOriented: true,
      omitEmptyFields: false
    };

    return processFile(COL_XLSX, COL_JSON, options, function(err, data) {
      expect(err).to.be.an('undefined');
      const result = JSON.parse(fs.readFileSync(COL_JSON, 'utf8'));
      JSON.stringify(result).should.equal(COL_SHEET_1_JSON);
      JSON.stringify(data).should.equal(COL_SHEET_1_JSON);
      return done();
    });
  });


  it('should process sheet 2 of col oriented Excel files, write the result, and return the parsed object', function(done) {
    const options = {
      sheet:'2',
      isColOriented: true,
      omitEmptyFields: false
    };

    return processFile(COL_XLSX, COL_JSON, options, function(err, data) {
      expect(err).to.be.an('undefined');
      const result = JSON.parse(fs.readFileSync(COL_JSON, 'utf8'));
      JSON.stringify(result).should.equal(COL_SHEET_2_JSON);
      JSON.stringify(data).should.equal(COL_SHEET_2_JSON);
      return done();
    });
  });


  it('should create the destination directory if it does not exist', function(done) {
    const options = {
      sheet:'1',
      isColOriented: true,
      omitEmptyFields: false
    };

    return processFile(COL_XLSX, COL_JSON_NESTED, options, function(err, data) {
      expect(err).to.be.an('undefined');
      const result = JSON.parse(fs.readFileSync(COL_JSON_NESTED, 'utf8'));
      JSON.stringify(result).should.equal(COL_SHEET_1_JSON);
      JSON.stringify(data).should.equal(COL_SHEET_1_JSON);
      return done();
    });
  });


  it('should return a parsed object without writing a file', function(done) {
    // Ensure result file does not exit
    try { fs.unlinkSync(ROW_JSON); }
    catch (error) {} // ignore file does not exist

    const options = {
      sheet:'1',
      isColOriented: false,
      omitEmptyFields: false
    };

    return processFile(ROW_XLSX, undefined, options, function(err, data) {
      expect(err).to.be.an('undefined');
      fs.existsSync(ROW_JSON).should.equal(false);
      JSON.stringify(data).should.equal(ROW_SHEET_1_JSON);
      return done();
    });
  });


  it('should not convert text that looks like a number to a number when directed', function(done) {
    const options = {
      sheet:'1',
      isColOriented: false,
      omitEmptyFields: false,
      convertTextToNumber: false
    };

    return processFile(ROW_XLSX, undefined, options, function(err, data) {
      expect(err).to.be.an('undefined');
      data[0].address.should.have.property('zip', '81615');
      data[1].address.should.have.property('zip', '81657');
      return done();
    });
  });


  return it('should notify on write error', done => processFile(ROW_XLSX, 'build', TEST_OPTIONS, function(err, data) {
    expect(err).to.be.an('string');
    return done();
  }));
});


//=============================== Coverage summary ===============================
//  Statements   : 100% ( 133/133 )
//  Branches     : 100% ( 61/61 )
//  Functions    : 100% ( 14/14 )
//  Lines        : 100% ( 106/106 )
//================================================================================
