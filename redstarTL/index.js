const serialport = require('serialport');
const Readline = require('@serialport/parser-readline')
// import serialport from 'serialport';
// import { Readline } from '@serialport/parser-readline'

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

        theApp.resCallback = null;
        _objres.result = 'ok'
        resolve(_objres)
    }
    _sendCmd('<rdconf>\r\n')
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

function _updateConfigDataFormUI() {

    delete theApp.configData.result;

    let _configData = theApp.configData

    _configData.ssid = document.querySelector('#ssid input').value;
    _configData.passwd = document.querySelector('#passwd input').value;
    _configData.index = document.querySelector('#group-index input').value;
    _configData.remoteIp = document.querySelector('#remote-ip input').value
    _configData.remotePort = document.querySelector('#remote-port input').value
    _configData.localPort = document.querySelector('#local-port input').value

    _configData.loopDelay_req = document.querySelector('#loop-delay-req input').value
    _configData.loopDelay_res = document.querySelector('#loop-delay-res input').value

    if(theApp.firmType == 'OT1D1') {
        _configData.sensor_cooltime = document.querySelector('#sensor-cooltime input').value
    }
    else {
        _configData.trigger_delay = document.querySelector('#trigger-delay input').value
        _configData.relay_pluse = document.querySelector('#relay-pulse input').value
        _configData.relay_pluse_limit = document.querySelector('#relay-pulse-limit input').value
        _configData.control_pwm = document.querySelector("#control-pwm input").value

        _configData.max_fire_count = document.querySelector('#max-fire-count input').value
    }
    _configData.extra = document.querySelector('#extra-info input').value
}

async function _loadformDevice() {

    let _res = await new Promise(_dumpConfigAll);

    if (_res.result == 'ok') {

        console.log(_res);

        document.querySelector('#ssid input').value = _res.ssid
        document.querySelector('#passwd input').value = _res.passwd
        document.querySelector('#group-index input').value = _res.index;
        document.querySelector('#remote-ip input').value = _res.remoteIp;
        document.querySelector('#remote-port input').value = _res.remotePort;
        document.querySelector('#local-port input').value = _res.localPort;

        document.querySelector('#loop-delay-req input').value = _res.loopDelay_req;
        document.querySelector('#loop-delay-res input').value = _res.loopDelay_res;

        if(theApp.firmType == 'OT1D1') {
            //오뚜기 타겟용 
            document.querySelector('#sensor-cooltime').classList.remove('hide')
            document.querySelector('#sensor-cooltime input').value = _res.sensor_cooltime
        }
        else {
            document.querySelector('#trigger-delay').classList.remove('hide')
            document.querySelector('#relay-pulse').classList.remove('hide')
            document.querySelector('#relay-pulse-limit').classList.remove('hide')
            document.querySelector('#max-fire-count').classList.remove('hide')
            document.querySelector('#control-pwm').classList.remove('hide')
            

            document.querySelector('#trigger-delay input').value = _res.trigger_delay
            document.querySelector('#relay-pulse input').value = _res.relay_pluse
            document.querySelector('#relay-pulse-limit input').value = _res.relay_pluse_limit
            document.querySelector('#control-pwm input').value = _res.control_pwm;
            
            document.querySelector('#max-fire-count input').value = _res.max_fire_count
        }
        
        document.querySelector('#extra-info input').value = _res.extra

        theApp.configData = _res;

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

    try {

        document.querySelector("#btn-connect").classList.add("hide");
        document.querySelector("#btn-close").classList.remove("hide");

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

                    // if (_objres.tm != undefined) {
                    //     document.querySelector("#device-info .fct").innerText = _objres.tm / 1000;
                    // }
                    if (theApp.resCallback)
                        theApp.resCallback(_objres);

                }
            })

            // let _objres = JSON.parse(data);
            // if (theApp.resCallback)
            //     theApp.resCallback(_objres);



        });

        let _res = await new Promise((resolve, reject) => {

            serialportObj.on("open", async (evt) => {

                console.log('open at baudrate :' + theApp.spConfig.baudRate);
                theApp.resBuffer = "";
                let _time = setTimeout(() => {
                    reject({ err: 'timeout' })
                }, 5000)

                theApp.resCallback = function (_objres) {
                    console.log(_objres)
                    clearTimeout(_time)
                    theApp.resCallback = null
                    resolve(_objres)
                }

                let _res = await _sendCmd("<rdsys>\r\n");
                console.log(_res)

            });
        })

        if (_res.err === undefined) {
            theApp.doms.indo_text.textContent = `firm tye :  ${_res.type} , firm version : ${_res.v}, devid : ${_res.devid}`
            theApp.firmType = _res.type
        } else {
            theApp.doms.indo_text.textContent = 'conection failed'
        }

        _loadformDevice()

    }
    catch (e) {
        alert(e.err)
        document.querySelector("#btn-connect").classList.remove("hide");
        document.querySelector("#btn-close").classList.add("hide");
    }
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

        //UI내용 모두 지우기
        document.querySelectorAll('.config-form input').forEach(_ => {
            _.value = ''
        })

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

    try {
        document.querySelector('#hide-menu').classList.remove("hide");
        document.querySelector('#main-menu').classList.add('hide');


        let _res = await new Promise(async (resolve, reject) => {

            theApp.resCallback = (_objres) => {
                // console.log(_objres)
                resolve(_objres)
            }
            _updateConfigDataFormUI()
            let _data = JSON.stringify(theApp.configData)
            console.log(_data);
            _sendCmd(`<wrconf>\r\n${_data}\r\n`)
        })
        console.log(_res)
        alert(_res.r)

        document.querySelector('#hide-menu').classList.add("hide");
        document.querySelector('#main-menu').classList.remove('hide');

    }
    catch (e) {
        alert('save err')
        console.log(e)
    }

})

document.querySelector("#btn-default").addEventListener('click', async function (evt) {

    document.querySelector('#hide-menu').classList.remove("hide");
    document.querySelector('#main-menu').classList.add('hide');

    await _sendCmd('<format>\r\n')

    setTimeout( function() {
        location.reload()
    },3000)
    
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
    catch (e) {
        console.log(e)
        alert('can not get list')
    }

})();

