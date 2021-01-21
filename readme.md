
### 프로잭트 설치법
만약 serialport 가 설피되지않으면 package.json에 나와 있는 버전을 무시하고 최신버전으로 설치한다.  
electron,electron-rebuild 도 마찬가지이다.  

## 시리얼포트 재빌드
- 일랙트론상에서 시리얼포트같은 네이티브를 실행시키려면 리빌드해주어야한다.(serialport가 설치된 node_modules 이 있는 폴더에서 해주어야한다.)  
./node_modules/.bin/electron-rebuild   

### 릴리즈 만드는법

* 빈폴더를 하나 생성한다 
* package.json 을 카피한다.
* npm install 
* npx electron-rebuild 또는 .\node_modules\.bin\electron-rebuild 
* 그안에 app 이름으로 폴더를 하나더 만든다.
* /fcuTester 폴더의 모든 파일을 app에 카피한다.  

* windows : 다음과 같은 내용으로 bat 파일을 만든다.
```
.\node_modules\.bin\electron ./app

```

* macosx

* linux