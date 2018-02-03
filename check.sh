#!/bin/bash
if [ $1 ]
then
	delay=$1
else
	delay=3
fi

while :
do
	let secs=(`date +"%s"`-`stat -f "%m" update.html`)+1;
	if [ `find . -type f -name "*" -mtime -${secs}s | wc -l` -gt 1 ]
	then
		echo -e "/*<script>window.onload=function(){var url=location.href,hash=document.getElementsByTagName('TEXTAREA')[0].value;url=decodeURIComponent(url.slice(url.lastIndexOf('=')+1));parent.location.href=url+'#'+encodeURIComponent(hash.slice(hash.indexOf('\\\\n')+1).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')||' ');}</script><textarea>*/\n"`date +"%s"` > update.html
	fi
	sleep $delay
done
