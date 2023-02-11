set port_name=%1
set file_name=%2
.\toolchain\window\tools\python3\3.7.2-post1\python3.exe .\toolchain\window\hardware\esp8266\2.7.4\tools\upload.py --chip esp8266 --port %port_name% --baud 921600 --before default_reset --after hard_reset write_flash 0x0 %file_name% 