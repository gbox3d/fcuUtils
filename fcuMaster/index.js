

var serialport = require('serialport');


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

    //console.log(port);

    let _li = document.createElement('li');
    _li.innerText = port.comName + "(" + port.manufacturer + ")";
    _li.comName = port.comName;

    document.querySelector('#portList').appendChild(_li);

  });
});

document.querySelector("#portList").addEventListener('click',function (evt) {


  //console.log(this)

  console.log(evt.target.comName);
  theApp.SerialDeviceName = evt.target.comName;
  document.querySelector('#select-device-name').innerText = theApp.SerialDeviceName;
  document.querySelector("#btn-connect").disabled = false;


})


function _dumpConfigAll()
{
  let _cmd = {c:"cr"};
  this.write(JSON.stringify(_cmd), function(err) {
    if(err) console.log(err);
    theApp.resBuffer = "";

    theApp.resCallback = function (_objres) {
      let _fpw = _objres.m_nPwmFirePowerControl / 255

      document.querySelector("#fire-pwm input").value = ((_fpw.toFixed(4)) * 100).toFixed(2);

      document.querySelector("#cutoff-time input").value =  _objres.m_nCutOffThresHold;
      document.querySelector("#downpluse-term input").value =  _objres.m_pulseDown;
      document.querySelector("#stepping-term input").value =  _objres.m_nRecoilPluse;
    }

  });

}


document.querySelector("#btn-connect").addEventListener('click',function(evt) {

  this.disabled = true;

  let serialportObj = new serialport(
    theApp.SerialDeviceName , theApp.spConfig
  );


  serialportObj.on("open", function(evt) {

    console.log('open at baudrate :' + theApp.spConfig.baudRate);

    //console.log(this);


//{"m_pulseUp":120000,"m_pulseDown":500000,"m_nPwmFirePowerControl":164,vm_nCutOffThresHold":50000,"m_nRecoilPluse":0}

    setTimeout(_dumpConfigAll.bind(this),2000)


    //데이터 읽기
    this.on('data', function(data) {
      //console.log(data);

      for(var i= 0;i<data.length;i++) {
        if(data[i] == 0x0d) {
          try {
            console.log(theApp.resBuffer);
            let _objres = JSON.parse(theApp.resBuffer);
            console.log(_objres);

            theApp.resCallback(_objres);

          }

          catch(e) {
            console.log(e);
          }
        }
        else {
          theApp.resBuffer += String.fromCharCode(data[i] );

        }
      }


    });

    theApp.spObj = serialportObj;

  });


});

document.querySelector("#fire-pwm .btn-save").addEventListener('click',function (evt) {
  let _cmd = JSON.stringify( {c:"cs",p1:"fpw",p2: Math.round(this.parentElement.querySelector('input').value /100 * 255 ) } );
  _cmd += JSON.stringify({c:"svcfg"});
  console.log(_cmd)
  theApp.resBuffer = "";
  theApp.spObj.write(_cmd, function(err) {

    theApp.resCallback = function (_objres) {
      console.log(_objres)
    }
  });
})

document.querySelector("#cutoff-time .btn-save").addEventListener('click',function (evt) {
  let _cmd = JSON.stringify( {c:"cs",p1:"cth",p2: parseInt( this.parentElement.querySelector('input').value) } );
  _cmd += JSON.stringify({c:"svcfg"});
  console.log(_cmd)
  theApp.resBuffer = "";
  theApp.spObj.write(_cmd, function(err) {

    theApp.resCallback = function (_objres) {
      console.log(_objres)
    }
  });
})

document.querySelector("#downpluse-term .btn-save").addEventListener('click',function (evt) {
  let _cmd = JSON.stringify( {c:"cs",p1:"pd",p2: parseInt(this.parentElement.querySelector('input').value) } );
  _cmd += JSON.stringify({c:"svcfg"});
  console.log(_cmd)
  theApp.resBuffer = "";
  theApp.spObj.write(_cmd, function(err) {

    theApp.resCallback = function (_objres) {
      console.log(_objres)
    }
  });
})

document.querySelector("#btn-default").addEventListener('click',function (evt) {
  let _cmd = JSON.stringify({c:"clcfg"});
  _cmd += JSON.stringify({c:"svcfg"});
  console.log(_cmd)
  theApp.resBuffer = "";
  theApp.spObj.write(_cmd, function(err) {

    theApp.resCallback = function (_objres) {
      console.log(_objres)
    }

  });

});


