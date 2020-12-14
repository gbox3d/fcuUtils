
const serialport = require('serialport');
//const Delimiter = require('@serialport/parser-delimiter')
const Readline = require('@serialport/parser-readline')


console.log(serialport);

var theApp = {
  spConfig : {
    baudRate:115200,
    parser: new (serialport.parsers).Readline("\r\n") //개행문자기준으로 마샬링해주기
  },
  resBuffer : "",
  resCallback : function () {

  }
}

serialport.list().then(
  ports => {
    ports.forEach(port=> {
      let _li = document.createElement('li');
      _li.innerText = port.comName + "(" + port.manufacturer + ")";
      _li.comName = port.comName;

      document.querySelector('#portList').appendChild(_li);

    })
  },
  err => console.error(err)
)

// serialport.list(function (err, ports) {
//   ports.forEach(function(port) {
//     let _li = document.createElement('li');
//     _li.innerText = port.comName + "(" + port.manufacturer + ")";
//     _li.comName = port.comName;

//     document.querySelector('#portList').appendChild(_li);

//   });
// });

document.querySelector("#portList").addEventListener('click',function (evt) {

  console.log(evt.target.comName);
  theApp.SerialDeviceName = evt.target.comName;
  document.querySelector('#select-device-name').innerText = theApp.SerialDeviceName;
  document.querySelector("#btn-connect").disabled = false;

})


function _dumpConfigAll()
{
  theApp.resBuffer = "";
  theApp.resCallback = function (_objres) {
    let _fpw = _objres.fpw / 255
    document.querySelector("#fire-pwm input").value = ((_fpw.toFixed(4)) * 100).toFixed(2);

    document.querySelector("#power-down-tick input").value =  _objres.pdt / 1000;
    document.querySelector("#power-down-delta input").value =  _objres.pdd;

    document.querySelector("#startup-recover-tick input").value =  _objres.sta / 1000;

    document.querySelector("#downpluse-term input").value =  _objres.pd / 1000;
    document.querySelector("#front-stepping-term input").value =  _objres.fst / 1000;
    document.querySelector("#cutoff-term input").value =  _objres.cth / 1000;

    theApp.resCallback = null;

  }

  let _cmd = {c:"cr"};
  this.write(JSON.stringify(_cmd), function(err) {
    if(err) console.log(err);
    
  });

}


document.querySelector("#btn-connect").addEventListener('click',function(evt) {

  this.disabled = true;

  let serialportObj = new serialport(
    theApp.SerialDeviceName , theApp.spConfig
  );

  let parser  = serialportObj.pipe(new Readline({ delimiter: '\r\n' }))
  
  parser.on('data', function(data) {
    
    console.log(data)
    let _objres = JSON.parse(data.toString());

    if(_objres.tm != undefined) {
      document.querySelector("#device-info .fct").innerText =  _objres.tm / 1000;
    }
    if(theApp.resCallback)
      if(_objres.pu !== undefined )
        theApp.resCallback(_objres);
  });

  serialportObj.on("open", function(evt) {

    console.log('open at baudrate :' + theApp.spConfig.baudRate);

    setTimeout(_dumpConfigAll.bind(this),2000)


    //데이터 읽기
    this.on('data', function(data) {
     
    });

    theApp.spObj = serialportObj;

  });
});


function _sendCmd(_cmd)
{
  
  //console.log(_cmd)
  theApp.resBuffer = "";
  theApp.resCallback = function (_objres) {
    console.log(_objres)
  }

  theApp.spObj.write(_cmd, function(err) {
    alert("save success")
  });

}

document.querySelector("#fire-pwm .btn-save").addEventListener('click',function (evt) {
  let _cmd = JSON.stringify( {c:"cs",p1:"fpw",p2: Math.round(this.parentElement.querySelector('input').value /100 * 255 ) } );
  _cmd += JSON.stringify({c:"svcfg"});
  _sendCmd(_cmd)
})

document.querySelector("#downpluse-term .btn-save").addEventListener('click',function (evt) {
  let _cmd = JSON.stringify( {c:"cs",p1:"pd",p2: parseInt(this.parentElement.querySelector('input').value) } );
  _cmd += JSON.stringify({c:"svcfg"});
  _sendCmd(_cmd)
})


document.querySelector("#power-down-tick .btn-save").addEventListener('click',function (evt) {
  let _cmd = JSON.stringify( {c:"cs",p1:"pdt",p2: parseInt(this.parentElement.querySelector('input').value)*1000 } );
  _cmd += JSON.stringify({c:"svcfg"});
  _sendCmd(_cmd)
})

document.querySelector("#power-down-delta .btn-save").addEventListener('click', function (evt) {
  let _cmd = JSON.stringify(
    {
      c: "cs", p1: "pdd",
      p2: parseInt(this.parentElement.querySelector('input').value)
    }
  );
  _cmd += JSON.stringify({ c: "svcfg" });
  _sendCmd(_cmd)
})

document.querySelector("#cutoff-term .btn-save").addEventListener('click', function (evt) {
  let _cmd = JSON.stringify(
    {
      c: "cs", p1: "cth",
      p2: parseInt(this.parentElement.querySelector('input').value) * 1000
    }
  );
  _cmd += JSON.stringify({ c: "svcfg" });
  _sendCmd(_cmd)
})

document.querySelector("#startup-recover-tick .btn-save").addEventListener('click', function (evt) {
  let _cmd = JSON.stringify(
    {
      c: "cs", p1: "sta",
      p2: parseInt(this.parentElement.querySelector('input').value) * 1000
    }
  );
  _cmd += JSON.stringify({ c: "svcfg" });
  _sendCmd(_cmd)
})

document.querySelector("#front-stepping-term .btn-save").addEventListener('click', function (evt) {
  let _cmd = JSON.stringify(
    {
      c: "cs", p1: "fst",
      p2: parseInt(this.parentElement.querySelector('input').value) * 1000
    }
  );
  _cmd += JSON.stringify({ c: "svcfg" });
  _sendCmd(_cmd)
})


document.querySelector("#btn-default").addEventListener('click',function (evt) {
  let _cmd = JSON.stringify({c:"clcfg"});
  _cmd += JSON.stringify({c:"svcfg"});
  _sendCmd(_cmd)

});

//(_dumpConfigAll.bind(theApp.spObj))()


