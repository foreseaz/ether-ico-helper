#!/bin/bash


function run() {
    echo "running command: $@"
    eval "$@"
    return $?
}

function run_ignore_failure() {
    set +e
    run "$@"
    set -e
    return 0
}
