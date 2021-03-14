#!/bin/sh
set -e

dir="$( cd "$( dirname "$0" )" && pwd )"
cronline="0 0 * * * node \"${dir}/dist/bin/sendstats.js\""

addcronjob () {
    # $1 - crontab entry
    local tmpfile
    tmpfile=`mktemp`
    crontab -l > "${tmpfile}" 2> /dev/null || true
    if grep -Fq "${1}" "${tmpfile}"; then
        return 0
    fi
    echo "${1}" >> "${tmpfile}"
    crontab "${tmpfile}"
    rm "${tmpfile}"
}

addcronjob "${cronline}"
