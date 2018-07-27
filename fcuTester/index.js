
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
  let _cmd = JSON.stringify( {c:"cm",p1:"playGame"} );
  theApp.resBuffer = "";
  theApp.resCallback = function (_objres) {
    console.log(_objres)
    if(_objres.p1 == "rd") {
      document.querySelector("#fire-counter input").value = _objres.p2
    }
    else if(_objres.r == "fire") {
      document.querySelector("#fire-counter input").value = _objres.p1
    }
    
  }

  theApp.spObj.write(_cmd, function(err) {
    //alert("save success")
  });
})



