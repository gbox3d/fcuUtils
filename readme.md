
### 프로잭트 설치법
만약 serialport 가 설피되지않으면 package.json에 나와 있는 버전을 무시하고 최신버전으로 설치한다.  
electron,electron-rebuild 도 마찬가지이다.  

## 시리얼포트 재빌드
- 일랙트론상에서 시리얼포트같은 네이티브를 실행시키려면 리빌드해주어야한다.(serialport가 설치된 node_modules 이 있는 폴더에서 해주어야한다.)  
./node_modules/.bin/electron-rebuild   


### 릴리즈 만드는법

```bash
cd redstarTL
npm install --save-dev @electron-forge/cli
npx electron-forge import
npm run make
```

### 프로젝트 실행법

개발하면서 프로그램의 작동여부를 확인해볼려고 실행시켜보려면 다음과 같이 명려어를 입력한다.  

```bash
npm run start
```

### 펌웨어 업로딩 기능 설정

redstar_firmware.zip 을 [다운받는다.](https://github.com/gbox3d/fcuUtils/releases/download/firmware/redstar_firmware.zip)  
redstar_firmware.zip 을 압축해제한다.  
redstar_firmware 폴더를 redstarTL 폴더의 상위에 복사한다.  

```txt
--|
  +--redstarTL
  +--redstar_firmware
```

### 커멘트라인상으로 펌웨어 업로딩

```bash
cd redstar_firmware

# mac or linux
bash ./flash.sh /dev/tty.usbserial-1130 ./d1mini/egcs/egcsUnit.ino.bin

# windows
flash.bat COM3 d1mini\egcs\egcsUnit.ino.bin
```
