#! /bin/sh

code=0;
for file in $(npx prettier -l .); do
    DIFF=$(diff "$file" <(npx prettier "$file"))
    IFS=$'\n'
    for line in $DIFF; do
        code=1
        echo "DIFF: '$line'"
        if [[ "$line" =~ ^[0-9] ]]; then
            lines=$(echo $line | cut -dc -f1 | tr ',' $'\n')
            idx=0;
            min=""
            max=""
            for n in $lines; do
                if [ "$idx" -eq 0 ]; then
                    min=$n
                    max=$n
                elif [ "$idx" -eq 1 ]; then
                    max=$n
                fi
                ((idx+=1))
            done
            echo "min=$min max=$max"
            echo "::error file=$file,line=$min,endLine=$max,title=PRETTIER-ERROR::Prettier error in $file"
        fi
    done
done

exit $code
