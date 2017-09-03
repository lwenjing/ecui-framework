#! /bin/bash
if [ ! $1 ]
then
	exit(0)
fi

if [ ! -d $1 ]
then
	git clone "http://192.168.155.56:8886/fe/"$1".git"
else
	cd $1
	git pull
	cd ..
fi

files=(ecui.css ecui.js ie-es5.js css images src tools)
for file in $files
do
	if [ ! -f $1"/"$file ]
	then
		ln $file $1"/"$file
	fi
done

local.sh
