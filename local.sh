#! /bin/bash
function scandir() {
    for file in `ls $1`
    do
        if [ ! $1 = "." ]
        then
            file=$1"/"$file
        fi
        if [ -d $file ]
        then
            cd $file
            scandir .
            cd ..
        else
            if [ "${file##*.}" = "css" ] && [ ! -f $file".html" ]
            then
                echo $file"->"$file".html"
                ln -s $file $file".html"
            fi
        fi
    done
}

scandir .
