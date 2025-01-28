#!/bin/bash
#
# Copyright 2022 Hughes, an Echostar Company

set -e


# bash-formatted config file to convert
conf="$1"
if [ -z "$conf" ] || echo "$conf" | egrep -q '^(-h|--help)$'; then
    echo "Usage: $(basename $0) <shell-formatted-config-file>"
    exit 0
fi

if [ ! -e "$conf" ]; then
    echo "ERROR: cannot find config file: '$conf'" 1>&2
    exit 1
fi


# run the conversion
while read line; do

    # strip any comments
    line=$(echo "$line" | sed -r -e 's;#.*;;')

    # look for assignment
    if ! echo $line | grep -q =; then
        continue
    fi

    # evaluate and then echo out Make syntax
    key=$(echo $line | cut -d = -f 1)
    declare -n value=$key

    eval $line
    echo "export $key := $value"

done <<-EOT
	$(cat "$conf")
EOT

