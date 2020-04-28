/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Create a list of json objects; 1 object per excel sheet row
//
// Assume: Excel spreadsheet is a rectangle of data, where the first row is
// object keys and remaining rows are object values and the desired json 
// is a list of objects. Alternatively, data may be column oriented with
// col 0 containing key names.
//
// Dotted notation: Key row (0) containing firstName, lastName, address.street, 
// address.city, address.state, address.zip would produce, per row, a doc with 
// first and last names and an embedded doc named address, with the address.
//
// Arrays: may be indexed (phones[0].number) or flat (aliases[]). Indexed
// arrays imply a list of objects. Flat arrays imply a semicolon delimited list.
//
// USE:
//  From a shell
//    coffee src/excel-as-json.coffee
//
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const BOOLTEXT = ['true', 'false'];
const BOOLVALS = {'true': true, 'false': false};

const isArray = obj => Object.prototype.toString.call(obj) === '[object Array]';

// Extract key name and array index from names[1] or names[]
// return [keyIsList, keyName, index]
// for names[1] return [true,  keyName,  index]
// for names[]  return [true,  keyName,  undefined]
// for names    return [false, keyName,  undefined]
const parseKeyName = function (key) {
  const index = key.match(/\[(\d+)\]$/);
  switch (false) {
    case !index:
      return [true, key.split('[')[0], Number(index[1])];
    case key.slice(-2) !== '[]':
      return [true, key.slice(0, -2), undefined];
    default:
      return [false, key, undefined];
  }
};

const convertValueExplicit = function (value, type) {
  let res = value;
  switch (type) {
    case "number": {
      res = Number(value);
      if(Number.isNaN(res)) {
        throw `Cannot convert "${value}" to number`
      }
      break;
    }
    case "boolean": {
      res = BOOLVALS[value.toLowerCase()];
      break;
    }
  }
  return res;
}

// Convert a list of values to a list of more native forms
const convertValueList = (list, options, column) => Array.from(list).map((item) => convertValue(item, options, column));

// Convert values to native types
// Note: all values from the excel module are text
var convertValue = function (value, options, column) {
  if (options.columnMapping && options.columnMapping[column] && options.columnMapping[column].type) {
    return convertValueExplicit(value, options.columnMapping[column].type)
  } else {
    // isFinite returns true for empty or blank strings, check for those first
    if ((value.length === 0) || !/\S/.test(value)) {
      return value;
    } else if (isFinite(value)) {
      if (options.convertTextToNumber) {
        return Number(value);
      } else {
        return value;
      }
    } else {
      const testVal = value.toLowerCase();
      if (Array.from(BOOLTEXT).includes(testVal)) {
        return BOOLVALS[testVal];
      } else {
        return value;
      }
    }
  }
};

// Assign a value to a dotted property key - set values on sub-objects
var assign = function (obj, key, value, options, column) {
  // On first call, a key is a string. Recursed calls, a key is an array
  let i;
  if (typeof key !== 'object') {
    key = key.split('.');
  }
  // Array element accessors look like phones[0].type or aliases[]
  const [keyIsList, keyName, index] = Array.from(parseKeyName(key.shift()));

  if (key.length) {
    if (keyIsList) {
      // if our object is already an array, ensure an object exists for this index
      if (isArray(obj[keyName])) {
        if (!obj[keyName][index]) {
          let asc, end;
          for (i = obj[keyName].length, end = index, asc = obj[keyName].length <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
            obj[keyName].push({});
          }
        }
        // else set this value to an array large enough to contain this index
      } else {
        obj[keyName] = ((() => {
          let asc1, end1;
          const result = [];
          for (i = 0, end1 = index, asc1 = 0 <= end1; asc1 ? i <= end1 : i >= end1; asc1 ? i++ : i--) {
            result.push({});
          }
          return result;
        })());
      }
      return assign(obj[keyName][index], key, value, options, column);
    } else {
      if (obj[keyName] == null) {
        obj[keyName] = {};
      }
      return assign(obj[keyName], key, value, options, column);
    }
  } else {
    if (keyIsList && (index != null)) {
      console.error(`WARNING: Unexpected key path terminal containing an indexed list for <${keyName}>`);
      console.error("WARNING: Indexed arrays indicate a list of objects and should not be the last element in a key path");
      console.error("WARNING: The last element of a key path should be a key name or flat array. E.g. alias, aliases[]");
    }
    if (keyIsList && (index == null)) {
      if (value != null && value !== '') {
        return obj[keyName] = convertValueList(value.split(';'), options, column);
      } else if (!options.omitEmptyFields) {
        return obj[keyName] = [];
      }
    } else {
      if (!(options.omitEmptyFields && (value === ''))) {
        return obj[keyName] = convertValue(value, options, column);
      }
    }
  }
};

// Transpose a 2D array
const transpose = matrix => __range__(0, matrix[0].length, false).map((i) => (Array.from(matrix).map((t) => t[i])));

// Convert 2D array to nested objects. If row oriented data, row 0 is dotted key names.
// Column oriented data is transposed
const convert = function (data, options) {

  if (options.isColOriented) {
    data = transpose(data);
  }

  const keys = data[0];
  let mappedKeys = keys;
  const rows = data.slice(1);

  if (options.columnMapping) {
    mappedKeys = keys.map(key => {
      if (options.columnMapping[key] && options.columnMapping[key].mapping) {
        return options.columnMapping[key].mapping;
      }
      return key;
    })
  }

  const result = [];
  for (let row of Array.from(rows)) {
    const item = {};
    for (let index = 0; index < row.length; index++) {
      const value = row[index];
      assign(item, mappedKeys[index], value, options, keys[index]);
    }
    result.push(item);
  }
  return result;
};

const processRow = function (row, options) {
  let values = [];
  row.eachCell({includeEmpty: true}, (cell) => {
    let res
    let value = cell.value;
    if (value != null && value.formula) {
      res = value.result;
    } else {
      res = value;
    }
    if (value === null) {
      res = "";
    }
    res = res.toString();
    if(options.trimValues){
      res = res.trimEnd();
    }
    values.push(res);
  });
  return values;
}

const convertWorksheet = function (ws, options) {
  let data = [];
  ws.eachRow(row => data.push(processRow(row, options)));
  return convert(data, options);
};

// Write JSON encoded data to file
// call back is callback(err)
const write = function (data, dst, callback) {
  // Create the target directory if it does not exist
  const dir = path.dirname(dst);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return fs.writeFile(dst, JSON.stringify(data, null, 2), function (err) {
    if (err) {
      return callback(`Error writing file ${dst}: ${err}`);
    } else {
      return callback(undefined);
    }
  });
};

// src: xlsx file that we will read sheet 0 of
// dst: file path to write json to. If null, simply return the result
// options: see below
// callback(err, data): callback for completion notification
//
// options:
//   sheet:              string;  1:     numeric, 1-based index of target sheet
//   isColOriented:      boolean: false; are objects stored in excel columns; key names in col A
//   omitEmptyFields:    boolean: false: do not include keys with empty values in json output. empty values are stored as ''
//                                       TODO: this is probably better named omitKeysWithEmptyValues
//   convertTextToNumber boolean: true;  if text looks like a number, convert it to a number
//   trimValues          boolean; true;  trim all trailing spaces (default false)
//   columnMapping:      columnMappingShape  defines custom mapping of columns
//
//   const columnMappingShape = map(
//       string(),   //column header
//       shape({
//         mapping: string(),   //mapping according to excel-as-json possibilities
//         type: oneOf(["string", "number", "boolean"])   //type of column value
//       })
//   );
//
// convertExcel(src, dst) <br/>
//   will write a row oriented xlsx sheet 1 to `dst` as JSON with no notification
// convertExcel(src, dst, {isColOriented: true}) <br/>
//   will write a col oriented xlsx sheet 1 to file with no notification
// convertExcel(src, dst, {isColOriented: true}, callback) <br/>
//   will write a col oriented xlsx to file and notify with errors and parsed data
// convertExcel(src, null, null, callback) <br/>
//   will parse a row oriented xslx using default options and return errors and the parsed data in the callback
//
const _DEFAULT_OPTIONS = {
  sheet: 1,
  isColOriented: false,
  omitEmptyFields: false,
  convertTextToNumber: true
};

// Ensure options sane, provide defaults as appropriate
const _validateOptions = function (options) {
  if (!options) {
    options = _DEFAULT_OPTIONS;
  } else {
    if (!options.hasOwnProperty('sheet')) {
      options.sheet = 1;
    } else {
      // ensure sheet is a text representation of a number
      if (!isNaN(parseFloat(options.sheet)) && isFinite(options.sheet)) {
        if (options.sheet < 1) {
          options.sheet = 1;
        } else {
          // could be 3 or '3'; force to be '3'
          options.sheet = Number(options.sheet);
        }
      } else {
        // something bizarre like true, [Function: isNaN], etc
        options.sheet = 1;
      }
    }
    if (!options.hasOwnProperty('isColOriented')) {
      options.isColOriented = false;
    }
    if (!options.hasOwnProperty('omitEmptyFields')) {
      options.omitEmptyFields = false;
    }
    if (!options.hasOwnProperty('convertTextToNumber')) {
      options.convertTextToNumber = true;
    }
  }
  return options;
};

const processFile = function (src, dst, options, callback) {
  if (options == null) {
    options = _DEFAULT_OPTIONS;
  }
  if (callback == null) {
    callback = undefined;
  }
  options = _validateOptions(options);

  // provide a callback if the user did not
  if (!callback) {
    callback = function (err, data) {
    };
  }

  // NOTE: 'excel' does not properly bubble file not found and prints
  //       an ugly error we can't trap, so look for this common error first
  if (!fs.existsSync(src)) {
    return callback(`Cannot find src file ${src}`);
  } else {
    const wb = new ExcelJS.Workbook();
    let readPromise;
    if (src.endsWith(".xlsx")) {
      readPromise = wb.xlsx.readFile(src);
    } else if (src.endsWith(".csv")) {
      readPromise = wb.csv.readFile(src);
    }
    readPromise.catch((err) => callback(`Error reading ${src}: ${err}`))
    .then(() => {
      let sheet = Number(options.sheet) - 1;
      let ws;
      if (src.endsWith(".xlsx")) {
        ws = wb.worksheets.filter(s => s.orderNo === sheet)[0];
      } else {
        ws = wb.getWorksheet();
      }
      if (!ws) {
        callback(`No sheet found for ${sheet} possible sheets ${wb.worksheets.map((ws) => `${ws.name}:${ws.orderNo + 1}`).join(",")}`)
      }
      const result = convertWorksheet(ws, options);
      if (dst) {
        return write(result, dst, function (err) {
          if (err) {
            return callback(err);
          } else {
            return callback(undefined, result);
          }
        });
      } else {
        return callback(undefined, result);
      }
    }).catch((err) => callback(`Error processing ${src}: ${err}`))
  }
};

// This is the single expected module entry point
exports.processFile = processFile;

// Unsupported use
// Exposing remaining functionality for unexpected use cases, testing, etc.
exports.assign = assign;
exports.convert = convert;
exports.convertValue = convertValue;
exports.convertValue = convertValue;
exports.parseKeyName = parseKeyName;
exports._validateOptions = _validateOptions;
exports.transpose = transpose;

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}