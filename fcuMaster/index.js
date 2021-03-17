const serialport = require('serialport');
const Readline = require('@serialport/parser-readline')

// import {serialport} from '../node_modules/@serialport'
// import {Readline} from '../node_modules/@serialport/parser-readline'

// console.log(serialport);

var theApp = {
  spConfig: {
    baudRate: 115200,
    parser: new (serialport.parsers).Readline("\r\n") //개행문자기준으로 마샬링해주기
  },
  resBuffer: "",
  resCallback: null,
  cbSerialClose: null,
  doms: {
    indo_text: document.querySelector('#info-text')
  },
  SerialDeviceName: '',

}


function _dumpConfigAll(resolve, reject) {
  theApp.resBuffer = "";
  theApp.resCallback = function (_objres) {

    console.log(_objres)


    if (_objres.c !== undefined && _objres.c == 'cr') {
      console.log('cr cmd ok')
    } else {
      theApp.resCallback = null;
      _objres.result = 'ok'
      resolve(_objres)
    }

  }

  let _cmd = { c: "cr" };
  theApp.spObj.write(JSON.stringify(_cmd), function (err) {
    if (err) {
      console.log(err);
      reject({ result: 'err', err: err });
    }
  });

}

function _sendCmd(_cmd) {

  return new Promise(function (resolve, reject) {
    theApp.spObj.write(_cmd, function (err) {
      if (err == undefined) {
        console.log('send cmd')
        resolve('ok')
      }
      else {
        reject(err)
        // alert(err);
      }
      // alert("save success")
    });
  })

}

async function _loadformDevice() {

  let _res = await new Promise(_dumpConfigAll);

  if (_res.result == 'ok') {
    document.querySelector('#fire-pwm input').value = _res.fpw;
    document.querySelector("#cutoff-term input").value = _res.cth / 1000;
    document.querySelector("#downpluse-term input").value = _res.pd / 1000;
    document.querySelector('#bullet-capacity input').value = _res.fst;

    document.querySelector("#btn-close").classList.remove("hide");

  } else {
    theApp.doms.indo_text.textContent = '펌웨어가 응답하지않습니다.'
  }
}


//----------------------------------------------------------------
//핸들러
document.querySelector("#portList").addEventListener('click', function (evt) {

  console.log(evt.target.comName);
  theApp.SerialDeviceName = evt.target.comName;
  document.querySelector('#select-device-name').innerText = theApp.SerialDeviceName;
  document.querySelector("#btn-connect").disabled = false;

})

document.querySelector("#btn-connect").addEventListener('click', async function (evt) {

  if (theApp.SerialDeviceName == '') {
    alert('device 를 선택해 주세요.')
    return
  }
  // this.disabled = true;ㄴ
  document.querySelector("#btn-connect").classList.add("hide");
  theApp.doms.indo_text.textContent = '디바이스 접속중.....'


  let serialportObj = new serialport(
    theApp.SerialDeviceName, theApp.spConfig
  );
  theApp.spObj = serialportObj;

  let parser = serialportObj.pipe(new Readline({ delimiter: '\r\n' }))


  serialportObj.on('close', () => {
    console.log('close')

    //close call back
    if (theApp.cbSerialClose) {
      theApp.cbSerialClose()
    }

  })

  parser.on('data', function (data) {

    console.log(data)

    data.split('}').forEach(_ => {

      if (_.indexOf('{') == 0) {
        let _objres = JSON.parse(_ + '}');
        if (theApp.resCallback)
          theApp.resCallback(_objres);

      }
    })

  });

  let _res = await new Promise((resolve, reject) => {
    serialportObj.on("open", function (evt) {

      console.log('open at baudrate :' + theApp.spConfig.baudRate);
      theApp.resBuffer = "";
      let _time = setTimeout(() => {
        reject({ err: 'timeout' })
      }, 5000)
      theApp.resCallback = function (_objres) {
        console.log(_objres)
        clearTimeout(_time)
        if (_objres.r === 'version') {
          theApp.resCallback = null
          resolve(_objres)
        }
      }
    });

  })

  if (_res.err === undefined) {
    theApp.doms.indo_text.textContent = `firm tye :  ${_res.p1[1]} , firm version : ${_res.p1[0]}`
  } else {
    theApp.doms.indo_text.textContent = 'conection failed'
  }

  _loadformDevice()
});

document.querySelector('#btn-close').addEventListener('click', async () => {

  let _res = await new Promise((resolve, reject) => {

    theApp.cbSerialClose = () => {
      resolve({ r: 'ok' })
      theApp.cbSerialClose = null;
    }

    theApp.spObj.close(err => {
      if (err) {
        reject({ r: 'err:', err: err })
      }
    });

  });

  if (_res.r == 'ok') {
    theApp.doms.indo_text.textContent = 'conection closed'
    document.querySelector("#cutoff-term input").value = ''
    document.querySelector("#downpluse-term input").value = ''
    document.querySelector('#fire-pwm input').value = ''
    document.querySelector('#bullet-capacity input').value = ''
    document.querySelector("#btn-close").classList.add("hide");
    document.querySelector("#btn-connect").classList.remove("hide");

    theApp.SerialDeviceName = ''
    document.querySelector('#select-device-name').innerText = theApp.SerialDeviceName;


  }
  else {
    theApp.doms.indo_text.textContent = 'clode failed'
  }
})

document.querySelector('#btn-save').addEventListener('click', async function (evt) {


  document.querySelector('#hide-menu').classList.remove("hide");
  document.querySelector('#main-menu').classList.add('hide');


  try {
    await new Promise(async (resolve, reject) => {

      theApp.resCallback = (_objres) => {
        if (_objres.c === 'svcfg') {
          console.log('cmd ok');
          resolve();
        }
      }

      let _cmd = JSON.stringify({ c: "cs", p1: "cth", p2: parseInt(document.querySelector('#cutoff-term input').value) * 1000 }) +
        JSON.stringify({ c: "cs", p1: "pd", p2: parseInt(document.querySelector('#downpluse-term input').value) * 1000 }) +
        JSON.stringify({ c: "cs", p1: "fst", p2: parseInt(document.querySelector('#bullet-capacity input').value) }) +
        JSON.stringify({ c: "cs", p1: "fpw", p2: parseInt(document.querySelector('#fire-pwm input').value) })

      _cmd += JSON.stringify({ c: "svcfg" });
      await _sendCmd(_cmd)
    })

    console.log('save ok')
    alert('save ok')

  }
  catch (e) {
    alert('save err')
    console.log(e)
  }



  document.querySelector('#hide-menu').classList.add("hide");
  document.querySelector('#main-menu').classList.remove('hide');


})

document.querySelector("#btn-default").addEventListener('click', async function (evt) {

  document.querySelector('#hide-menu').classList.remove("hide");
  document.querySelector('#main-menu').classList.add('hide');

  await new Promise(async (resolve, reject) => {

    theApp.resCallback = (_objres) => {
      if (_objres.c === 'svcfg') {
        console.log('cmd ok');
        resolve();
      }
    }

    let _cmd = JSON.stringify({ c: "clcfg" });
    _cmd += JSON.stringify({ c: "svcfg" });
    _sendCmd(_cmd)
  })

  _loadformDevice()

  document.querySelector('#hide-menu').classList.add("hide");
  document.querySelector('#main-menu').classList.remove('hide');


  // alert('load default')

});


//start up code 
(async function () {

  try {
    let _ports = await serialport.list()

    _ports.forEach(port => {
      let _li = document.createElement('li');
      _li.innerText = port.comName + "(" + port.manufacturer + ")";
      _li.comName = port.comName;

      document.querySelector('#portList').appendChild(_li);

    })

    console.log(_ports)

  }
  catch(e) {
    console.log(e)
    alert('can not get list')
  }

})()
