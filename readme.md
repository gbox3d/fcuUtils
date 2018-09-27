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