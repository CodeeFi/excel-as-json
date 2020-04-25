#!/usr/bin/env bash

# Compile coffee src/test files
mkdir lib
mkdir test
cp src/* lib/
cp spec/* test/

# Replace the CoffeeScript test file reference to CoffeeScript source with js equivalents
sed -i '' -e 's/\.\.\/src\/excel-as-json/\.\.\/lib\/excel-as-json/' test/*
