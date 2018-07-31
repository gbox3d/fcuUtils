
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

serialport.list(function (err, ports) {
  ports.forEach(function(port) {
    let _li = document.createElement('li');
    _li.innerText = port.comName + "(" + port.manufacturer + ")";
    _li.comName = port.comName;

    document.querySelector('#portList').appendChild(_li);

  });
});

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
    console.log(_objres)

    document.querySelector("#config-data").innerText = JSON.stringify(_objres)

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
    
    console.log(data);
    let _objres = JSON.parse(data.toString());

    if(_objres.p1 == "rd") {
      document.querySelector("#fire-counter input").value = _objres.p2
    }
    else if(_objres.r == "fire") {
      document.querySelector("#fire-counter input").value = _objres.p1
    }
    else if(_objres.r == "cr") {
      document.querySelector("#max-bullet input").value = _objres.data[3]
      document.querySelector("#fpw input").value = _objres.data[6]
      document.querySelector("#cppc input").value = _objres.data[4]
    }
    else if(_objres.mxct) {
      document.querySelector("#max-bullet input").value = _objres.mxct
    }
    else if(_objres.tm != undefined) {
      document.querySelector("#info-pannel input.fct").value = parseInt(_objres.tm) / 1000
    }
   

    if(theApp.resCallback)
      theApp.resCallback(_objres);
  });

  serialportObj.on("open", function(evt) {

    console.log('open at baudrate :' + theApp.spConfig.baudRate);

    setTimeout(_dumpConfigAll.bind(this),2000)

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
    //alert("save success")
  });

}

document.querySelector("#fire-counter .btn-play-game").addEventListener('click',function (evt) {
  let _cmd = JSON.stringify( {c:"cm",p1:"readyToPlay"} );
  _cmd += JSON.stringify( {c:"cm",p1:"playGame"} );
  theApp.resBuffer = "";
  theApp.resCallback = function (_objres) {
  }

  theApp.spObj.write(_cmd, function(err) {
    //alert("save success")
  });
})

document.querySelector("#max-bullet button").addEventListener('click', function (evt) {
  let _cmd = JSON.stringify({
    c: "cs",
    p1: "stmx", 
    p2:  parseInt( document.querySelector("#max-bullet input").value)
  }
  );
  _cmd += JSON.stringify({c:"svcfg"});
  console.log(_cmd);
  document.querySelector("#max-bullet input").value = 0;
  theApp.spObj.write(_cmd, function(err) {

  });

});

document.querySelector("#fpw button").addEventListener('click', function (evt) {
  let _cmd = JSON.stringify({
    c: "cs",
    p1: "fpw", 
    p2:  parseInt( document.querySelector("#fpw input").value)
  }
  );
  _cmd += JSON.stringify({c:"svcfg"});
 
  theApp.spObj.write(_cmd, function(err) {});

});

document.querySelector("#cppc button").addEventListener('click', function (evt) {
  let _cmd = JSON.stringify({
    c: "cs",
    p1: "cppc", 
    p2:  parseInt( document.querySelector("#cppc input").value)
  }
  );
  _cmd += JSON.stringify({c:"svcfg"});
 
  theApp.spObj.write(_cmd, function(err) {});

});



