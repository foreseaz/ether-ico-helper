#!/bin/bash


source ./util.sh || exit 1

set -e # exit on failures

PROJECT_NAME="ICO HELPER"

run pip3 install -r ../requirments.txt

echo "Setup done"
