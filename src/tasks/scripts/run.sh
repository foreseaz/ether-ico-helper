#!/bin/bash

ico_file="../ico.json"
ico_temp_file="../ico_temp.json"
log_file="../crawler.log"
logo_dir="../logo"

python3 ../crawler.py "$ico_temp_file" "$log_file" "$logo_dir"
if [ -f "$ico_temp_file" ]
then
	mv "$ico_temp_file" "$ico_file"
fi
