
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
