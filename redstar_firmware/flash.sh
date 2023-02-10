#!/bin/bash

## 파라미터가 없으면 종료 
if [ "$#" -lt 1 ]; then
    echo "$# is Illegal number of parameters."
    echo "Usage: $0 [port] [firmware]"
	exit 1
fi

./toolchain/osx/tools/python3/3.7.2-post1/python3 ./toolchain/osx/hardware/esp8266/3.0.2/tools/upload.py --chip esp8266 --port $1 --baud 921600 --before default_reset --after hard_reset write_flash 0x0 $2 