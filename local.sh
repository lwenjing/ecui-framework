#! /bin/bash
function scandir() {
    for file in `ls $1`
    do
        file=$1"/"$file
        if [ -d $file ]
        then
            scandir $file
        else
            if [ "${file##*.}" = "css" ] && [ ! -f $file".html" ]
            then
                echo $file"->"$file".html"
                ln $file $file".html"
            fi
        fi
    done
}

scandir .