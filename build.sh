if [ ! $1 ]
then
    echo "build.sh [ProjectName]"
    exit -1
fi

output="output-"$1
if [ ! -d $output ]
then
    mkdir $output
fi

for file in `ls $1`
do
    if [ -d $1"/"$file ]
    then
    	if [ -f $1"/"$file"/"$file".js" ]
    	then
	        if [ ! -d $output"/"$file ]
	        then
	            mkdir $output"/"$file
	        fi
	        cd $1"/"$file
	        sed -e "s/ecui.esr.loadRoute('/\/\/{include file='route./g" -e "s/ecui.esr.loadClass('/\/\/{include file='class./g" -e "s/');/.js'}\/\//g" $file".js" | java -jar ../../lib-fe/smarty4j.jar --left //{ --right }// --charset utf-8 | java -jar ../../lib-fe/webpacker.jar --mode 1 --charset utf-8 -o "../../"$output"/"$file"/"$file".js"
	        sed -e "s/ecui.esr.loadRoute('/\/\/{include file='route./g" -e "s/ecui.esr.loadClass(*//g" -e "s/');/.css'}\/\//g" $file".js" | java -jar ../../lib-fe/smarty4j.jar --left //{ --right }// --charset utf-8 | lessc - --plugin=less-plugin-clean-css > "../../"$output"/"$file"/"$file".css"
	        sed -e "s/ecui.esr.loadRoute('/\/\/{include file='route./g" -e "s/ecui.esr.loadClass(*//g" -e "s/');/.html'}\/\//g" $file".js" | java -jar ../../lib-fe/smarty4j.jar --left //{ --right }// --charset utf-8 | sed -e "s/  / /g" -e "s/^[ ]*//g" -e "s/[ ]*$//g" -e "/^$/d" -e "/<script>window.onload=/d" > "../../"$output"/"$file"/"$file".html"
	        cd ../..
	    else
	    	if [ ! -f $1"/"$file"/.ecuidebug" ]
	    		cp -R $1"/"$file $output"/"
	    	fi
	    fi
    else
        if [ "${file##*.}" = "js" ]
        then
            cd $1
            sed -e "/ecui.esr.loadModule/d" -e "s/document.write('<script type=\"text\/javascript\" src/\/\/{include file/g" -e "s/><\/script>');/}\/\//g" $file | java -jar ../lib-fe/smarty4j.jar --left //{ --right }// --charset utf-8 | java -jar ../lib-fe/webpacker.jar --mode 1 --charset utf-8 -o "../"$output"/"$file
            cd ..
        else
            if [ "${file##*.}" = "css" ]
            then
                lessc --plugin=less-plugin-clean-css $1"/"$file > $output"/"$file
            else
                if [ "${file##*.}" = "html" ]
                then
                    sed -e "s/stylesheet\/less/stylesheet/g" -e "s/ / /g" -e "s/^[ ]*//g" -e "s/[ ]*$//g" -e "/^$/d" -e "/<script>window.onload=/d" $1"/"$file > $output"/"$file
                else
                    cp $1"/"$file $output"/"
                fi
            fi
        fi
    fi
done

cd lib-fe
lessc --plugin=less-plugin-clean-css ecui.css > "../"$output"/ecui.css"
sed -e "s/ *document.write('<script type=\"text\/javascript\" src/\/\/{include file/g" -e "s/><\/script>');/}\/\//g" ecui.js | java -jar smarty4j.jar --left //{ --right }// --charset utf-8 | java -jar webpacker.jar --mode 1 --charset utf-8 -o "../"$output"/ecui.js"
cp ie-es5.js "../"$output"/ie-es5.js"
cp -R images/* "../"$output"/images/"
cd ..

cd $output
tar -zcvf "../"$1".tar.gz" *
cd ..

rm -rf $output
