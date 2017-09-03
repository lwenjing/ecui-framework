#! /bin/bash
if [ ! $1 ]
then
    echo "checkout.sh <ProjectName> [git branch name]"
	exit -1
fi

if [ -d $1 ]
then
	echo $1" already existed"
	exit -2
fi

cd ..

git clone "http://192.168.155.56:8886/fe/"$1".git"
git checkout -b $2 "origin/"$2

files=(ecui.css ecui.js ie-es5.js css images src tools)
for file in $files
do
	if [ ! -f $1"/"$file ] && [ ! -d $1"/"$file ]
	then
		ln -s "lib-fe/"$file $1"/"$file
	fi
done

lib-fe/local.sh
cd lib-fe
