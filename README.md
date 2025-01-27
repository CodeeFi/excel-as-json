[![license:mit](https://img.shields.io/badge/license-mit-green.svg)](#license)
[![build:?](https://img.shields.io/travis/jiridudekusy/excel-as-json/master.svg)](https://travis-ci.org/jiridudekusy/excel-as-json)
[![build:?](https://img.shields.io/travis/jiridudekusy/excel-as-json/sprint?label=dev-build)](https://travis-ci.org/jiridudekusy/excel-as-json)

<br>

[![npm:](https://img.shields.io/npm/v/excel-as-json2.svg)](https://www.npmjs.com/package/excel-as-json2)
[![dependencies:?](https://img.shields.io/david/jiridudekusy/excel-as-json.svg)](https://david-dm.org/jiridudekusy/excel-as-json)
[![devDependency Status](https://img.shields.io/david/dev/jiridudekusy/excel-as-json.svg)](https://david-dm.org/jiridudekusy/excel-as-json?type=dev)


# Difference from excel-as-json

- No change in existing API
- Use ExcelJS internally(no native library compilation, support for large files and better performance)
- Support column mapping including custom post-processor
- Support for value trim
- Add support for custom csv delimiter
- Support for specifying sheet using name

# Convert Excel Files to JSON

## What

Parse Excel xlsx files into a list of javascript objects and optionally write that list as a JSON encoded file.

You may organize Excel data by columns or rows where the first column or row contains object key names and the remaining columns/rows contain object values.

Expected use is offline translation of Excel data to JSON files, although
all methods are exported for other uses.

## Install

```$ npm install excel-as-json --save-dev```

## Use

```js
convertExcel = require('excel-as-json').processFile;
convertExcel(src, dst, options, callback);
```

* src: path to source Excel file (xlsx only)
* dst: path to destination JSON file. If null, simply return the parsed object tree
* options: an object containing 
    * sheet: 1 based sheet index as text (default '1') or sheet name 
    * isColOriented: are object values in columns with keys in column A - default false
    * omitEmptyFields: omit empty Excel fields from JSON output - default false
    * convertTextToNumber: if text looks like a number, convert it to a number - default true
    * trimValues: trim all trailing spaces - default false
    * csvDelimiter: use custom csv delimiter
    * postProcess: function to post-process a single row. 
      It accepts a single argument with the object created from a row and returns a modified object. 
      If the function returns null or undefined, the whole row is ignored. 
    * columnMapping:     columnMappingShape  defines custom mapping of columns
    ```js
       const columnMappingShape = map(
           string(),   //column header
           shape({
             mapping: string(),   //mapping according to excel-as-json possibilities (foo.bar, foo.foo[], etc)
             type: oneOf(["string", "number", "boolean"])   //type of column value. Default type is string
           })
       );
    ```  
* callback(err, data): callback for completion notification

**NOTE** If options are not specified, defaults are used.

With these arguments, you can:

* convertExcel(src, dst) <br/>
  will write a row oriented xlsx sheet 1 to `dst` as JSON with no notification
* convertExcel(src, dst, {isColOriented: true}) <br/>
  will write a col oriented xlsx sheet 1 to file with no notification
* convertExcel(src, dst, {isColOriented: true}, callback) <br/>
  will write a col oriented xlsx to file and notify with errors and parsed data
* convertExcel(src, null, null, callback) <br/>
  will parse a row oriented xslx using default options and return errors and the parsed data in the callback

Convert a row/col oriented Excel file to JSON as a development task and
log errors:

```CoffeeScript
convertExcel = require('excel-as-json').processFile

options = 
    sheet:'1'
    isColOriented: false
    omitEmtpyFields: false

convertExcel 'row.xlsx', 'row.json', options, (err, data) ->
	if err then console.log "JSON conversion failure: #{err}"

options = 
    sheet:'1'
    isColOriented: true
    omitEmtpyFields: false

convertExcel 'col.xlsx', 'col.json', options, (err, data) ->
	if err then console.log "JSON conversion failure: #{err}"
```

Convert Excel file to an object tree and use that tree. Note that 
properly formatted data will convert to the same object tree whether
row or column oriented.

```CoffeeScript
convertExcel = require('excel-as-json').processFile

convertExcel 'row.xlsx', undefined, undefined, (err, data) ->
	if err throw err
	doSomethingInteresting data
	
convertExcel 'col.xlsx', undefined, {isColOriented: true}, (err, data) ->
	if err throw err
	doSomethingInteresting data
```

### Why?

* Your application serves static data obtained as Excel reports from
  another application
* Whoever manages your static data finds Excel more pleasant than editing JSON
* Your data is the result of calculations or formatting that is
  more simply done in Excel
  
### What's the challenge?

Excel stores tabular data. Converting that to JSON using only
a couple of assumptions is straight-forward. Most interesting
JSON contains nested lists and objects. How do you map a
flat data square that is easy for anyone to edit into these 
nested lists and objects?

### Solving the challenge

- Use a key row to name JSON keys
- Allow data to be stored in row or column orientation.
- Use javascript notation for keys and arrays
  - Allow dotted key path notation
  - Allow arrays of objects and literals

### Excel Data

What is the easiest way to organize and edit your Excel data? Lists of 
simple objects seem a natural fit for a row oriented sheets. Single objects
with more complex structure seem more naturally presented as column
oriented sheets. Doesn't really matter which orientation you use, the
module allows you to speciy a row or column orientation; basically, where
your keys are located: row 0 or column 0.

Keys and values:

* Row or column 0 contains JSON key paths
* Remaining rows/columns contain values for those keys
* Multiple value rows/columns represent multiple objects stored as a list
* Within an object, lists of objects have keys like phones[1].type 
* Within an object, flat lists have keys like aliases[]

### Examples

A simple, row oriented key

|firstName
|---------
| Jihad	

produces

```
[{
  "firstName": "Jihad"
}]
```

A dotted key name looks like

| address.street
|---
| 12 Beaver Court

and produces

```
[{
  "address": {
    "street": "12 Beaver Court"
    }
}]
```

An indexed array key name looks like

|phones[0].number 
|---
|123.456.7890

and produces 

```
[{
  "phones": [{
      "number": "123.456.7890"
    }]
}]
```

An embedded array key name looks like this and has ';' delimited values

| aliases[]
|---
| stormagedden;bob

and produces

```
[{
  "aliases": [
    "stormagedden",
    "bob"
  ]
}]
```

A more complete row oriented example

|firstName| lastName | address.street  | address.city|address.state|address.zip |
|---------|----------|-----------------|-------------|-------------|------------|
| Jihad	| Saladin  | 12 Beaver Court | Snowmass    | CO          | 81615      |
| Marcus  | Rivapoli | 16 Vail Rd      | Vail        | CO          | 81657      |

would produce

```JSON
[{
    "firstName": "Jihad",
    "lastName": "Saladin",
    "address": {
      "street": "12 Beaver Court",
      "city": "Snowmass",
      "state": "CO",
      "zip": "81615"
    }
  },
  {
    "firstName": "Marcus",
    "lastName": "Rivapoli",
    "address": {
      "street": "16 Vail Rd",
      "city": "Vail",
      "state": "CO",
      "zip": "81657"
    }
  }]
```

You can do something similar in column oriented sheets. Note that indexed 
and flat arrays are added.

|firstName | Jihad | Marcus |
| :--- | :--- | :--- |
|**lastName** | Saladin | Rivapoli |
|**address.street** |12 Beaver Court | 16 Vail Rd
|**address.city** | Snowmass | Vail
|**address.state** | CO | CO
|**address.zip**| 81615 | 81657
|**phones[0].type**| home | home
|**phones[0].number** |123.456.7890 | 123.456.7891
|**phones[1].type**| work | work
|**phones[1].number** | 098.765.4321 | 098.765.4322
|**aliases[]** | stormagedden;bob | mac;markie

would produce

```
[
  {
    "firstName": "Jihad",
    "lastName": "Saladin",
    "address": {
      "street": "12 Beaver Court",
      "city": "Snowmass",
      "state": "CO",
      "zip": "81615"
    },
    "phones": [
      {
        "type": "home",
        "number": "123.456.7890"
      },
      {
        "type": "work",
        "number": "098.765.4321"
      }
    ],
    "aliases": [
      "stormagedden",
      "bob"
    ]
  },
  {
    "firstName": "Marcus",
    "lastName": "Rivapoli",
    "address": {
      "street": "16 Vail Rd",
      "city": "Vail",
      "state": "CO",
      "zip": "81657"
    },
    "phones": [
      {
        "type": "home",
        "number": "123.456.7891"
      },
      {
        "type": "work",
        "number": "098.765.4322"
      }
    ],
    "aliases": [
      "mac",
      "markie"
    ]
  }
]
```
## Data Conversions

All values from the 'excel' package are returned as text. This module detects numbers and booleans and converts them to javascript types. Booleans must be text 'true' or 'false'. Excel FALSE and TRUE are provided 
from 'excel' as 0 and 1 - just too confusing.

## Caveats

During install (mac), you may see compiler warnings while installing the
excel dependency - although questionable, they appear to be benign.

## Running tests

You can run tests after GitHub clone and `npm install` with:

```bash
ᐅ npm run-script test

> excel-as-json@2.0.1 test /Users/starver/code/makara/excel-as-json
> tools/test.sh

  assign
    ✓ should assign first level properties
    ✓ should assign second level properties
    ✓ should assign third level properties
#...
```

## Bug Reports

To investigate bugs, we need to recreate the failure. In each bug report, please include:

* Title: A succinct description of the failure
* Body:
    * What is expected
    * What happened
    * What you did
    * Environment:
        * operating system and version
        * node version
        * npm version
        * excel-as-json version
    * Attach a small worksheet and code snippet that reproduces the error

## Contributing

This project is small and simple and intends to remain that way. If you want to add functionality, please raise an issue as a place we can discuss it prior to doing any work.

You are always free to fork this repo and create your own version to do with as you will, or include this functionality in your projects and modify it to your heart's content.

## TODO

- provide processSync - using 'async' module
- Detect and convert dates
- Make 1 column values a single object?


## Change History

### 0.4.0
- add support for specifying sheet using name
- add support custom post-processor

### 0.3.0
- Support column mapping
- Support for value trim
- Add support for custom csv delimiter
