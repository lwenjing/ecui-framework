#!/bin/sh
echo $1
if [[ $1 = 'lib-fe' ]]
then
	cat .git/lib_fe_config > .git/config
else
	cat .git/guopiao_config > .git/config
fi