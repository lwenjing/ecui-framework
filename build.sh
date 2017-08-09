java -jar smarty4j.jar ./ecui.js --left //{ --right }// --charset utf-8 -o ./release/ecui-all.js
java -jar webpacker.jar ./release/ecui-all.js --mode 1 --charset utf-8 -o ./release/ecui-2.0.0.js
