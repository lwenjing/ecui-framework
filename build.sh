if [ ! $1 ]
then
    echo "build.sh [ProjectName]"
    exit -1
fi

css_proc="lessc - --plugin=less-plugin-clean-css"
if [ $2 ]
then
    css_proc=$css_proc" | awk -f px2rem.awk -v div=$2"
fi
tpl_proc='java -jar ${path}smarty4j.jar --left //{ --right }// --charset utf-8'
compress_proc='java -jar ${path}webpacker.jar --mode 1 --charset utf-8'
reg_load="-e \"s/ecui.esr.loadRoute('/\/\/{include file='route./g\""
reg_script="-e \"s/ *document.write('<script type=\\\"text\\/javascript\\\" src=\([^>]*\)><\/script>');/\/\/{include file=\1}\/\//g\""
reg_comment="-e \"/<\\!--$/{N;s/\\n/ /;}\" -e \"s/  / /g\" -e \"s/<\\!-- *\\!-->//g\" -e \"s/^[ ]*//g\" -e \"s/[ ]*$//g\" -e \"/^$/d\" -e \"/<script>window.onload=/d\""

if [ $1 = 'ecui' ]
then
    if [ ! -d release ]
    then
        mkdir release
    fi
    echo "build ecui-2.0.0"
    path=""
    more ecui.css | eval $css_proc > release/ecui-2.0.0.css
    eval "sed $reg_script ecui.js" | eval $tpl_proc | eval $compress_proc > release/ecui-2.0.0.js
    exit 0
fi

if [ -f smarty4j.jar ]
then
    flag=1
    cd ..
fi
if [ ! -d "$1/common" ]
then
    ln -s ../lib-fe/common "$1/common"
fi

output="output-$1"
if [ ! -d $output ]
then
    mkdir $output
fi

if [ ! -d $1 ]
then
    echo "$1 doesn't exist"
    exit -2
fi

for file in `ls $1`
do
    if [ -d "$1/$file" ]
    then
    	if [ -f "$1/$file/$file.js" ]
    	then
            echo "process module-$file"
	        if [ ! -d "$output/$file" ]
	        then
	            mkdir "$output/$file"
	        fi
	        cd "$1/$file"
            path="../../lib-fe/"
	        eval "sed $reg_load -e \"s/ecui.esr.loadClass('/\/\/{include file='class./g\" -e \"s/');/.js'}\/\//g\" \"$file.js\"" | eval $tpl_proc | eval $compress_proc > "../../$output/$file/$file.js"
            eval "sed $reg_load -e \"s/ecui.esr.loadClass(*//g\" -e \"s/');/.css'}\/\//g\" \"$file.js\"" | eval $tpl_proc | eval $css_proc > "../../$output/$file/$file.css"
	        eval "sed $reg_load -e \"s/ecui.esr.loadClass(*//g\" -e \"s/');/.html'}\/\//g\" \"$file.js\"" | eval $tpl_proc | eval "sed $reg_comment" > "../../$output/$file/$file.html"
	        cd ../..
	    else
	    	if [ ! -f "$1/$file/.buildignore" ]
            then
                if [ ! -d "$output/$file/" ]
                then
                    mkdir "$output/$file/"
                fi
	    		cp -R "$1/$file/"* "$output/$file/"
	    	fi
	    fi
    else
        echo "process file-$file"
        if [ "${file##*.}" = "js" ]
        then
            cd $1
            path="../lib-fe/"
            eval "sed -e \"/ecui.esr.loadModule/d\" $reg_script $file" | eval $tpl_proc | eval $compress_proc > "../$output/$file"
            cd ..
        else
            if [ "${file##*.}" = "css" ]
            then
                cd $1
                more "$file" | eval $css_proc > "../$output/$file"
                cd ..
            else
                if [ "${file##*.}" = "html" ]
                then
                    eval "sed -e \"s/stylesheet\\/less(\\.[0-9]+)?/stylesheet/g\" $reg_comment \"$1/$file\"" > "$output/$file"
                else
                    cp "$1/$file $output/"
                fi
            fi
        fi
    fi
done

cd lib-fe
for file in `ls`
do
    if [ -f $file ]
    then
        if [ "${file##*.}" = "js" ]
        then
            echo "process file-$file"
            path=""
            more $file | eval "sed $reg_script" | eval $tpl_proc | eval $compress_proc > "../$output/$file"
        else
            if [ "${file##*.}" = "css" ]
            then
                echo "process file-$file"
                more $file | eval $css_proc > "../$output/$file"
            fi
        fi
    fi
done
if [ ! -d "../$output/images/" ]
then
    mkdir "../$output/images/"
fi
cp -R images/* "../$output/images/"
cd ..

rm "$1/common"

cd $output
tar -zcvf "../$1.tar.gz" *
cd ..

rm -rf $output

if [ $flag ]
then
    cd lib-fe
fi
