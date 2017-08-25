if [ $1 ]
then
	filename=$1
else
	filename="ecui-2.0.0.js"
fi
sed -e "s/ *document.write('<script type=\"text\/javascript\" src/\/\/{include file/g" -e "s/><\/script>');/}\/\//g" ecui.js | java -jar smarty4j.jar --left //{ --right }// --charset utf-8 | java -jar webpacker.jar --mode 1 --charset utf-8 -o $filename
