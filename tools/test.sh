#!/usr/bin/env bash

# Clean this one temp dir to ensure accurate code coverage
rm -rf build

# Use our custom coffee-coverage loader to generate instrumented coffee files
nyc mocha -R spec spec/all-specs.js
