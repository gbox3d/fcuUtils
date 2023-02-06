// const serialport = require('serialport');
// const Readline = require('@serialport/parser-readline')
// import serialport from 'serialport';
// import { Readline } from '@serialport/parser-readline'
// console.log(serialport);
const { contextBridge, ipcRenderer } = require('electron')

const theApp = {
    baud: 115200,
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

        ipcRenderer.send('sendData', _cmd)
        resolve('ok')
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

    if (theApp.firmType == 'OT1D1') {
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

    console.log(`try to load config from device`)

    theApp.doms.indo_text.textContent = '설정데이터 로딩중...'

    //time out 3초
    let hTimer = setTimeout(function () {
        _loadformDevice()
    }, 3000);

    let _res = await new Promise(_dumpConfigAll);

    theApp.doms.indo_text.textContent = '설정데이터 로딩완료'

    clearTimeout(hTimer)

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

        if (_res.extra === "egcs01") {
            //광센서방식 총기제어 시스템 
            document.querySelector('#extra-info input').value = _res.extra
            document.querySelector('#extra-info').classList.remove('hide')

            document.querySelector('#trigger-delay').classList.remove('hide')
            // document.querySelector('#relay-pulse').classList.remove('hide')
            // document.querySelector('#relay-pulse-limit').classList.remove('hide')
            document.querySelector('#max-fire-count').classList.remove('hide')
            // document.querySelector('#control-pwm').classList.remove('hide')


            document.querySelector('#trigger-delay input').value = _res.trigger_delay
            // document.querySelector('#relay-pulse input').value = _res.relay_pluse
            // document.querySelector('#relay-pulse-limit input').value = _res.relay_pluse_limit
            // document.querySelector('#control-pwm input').value = _res.control_pwm;

            document.querySelector('#max-fire-count input').value = _res.max_fire_count

        }
        else {
            if (theApp.firmType == 'OT1D1') {
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

        }



        document.querySelector('#extra-info input').value = _res.extra

        theApp.configData = _res;

    } else {
        theApp.doms.indo_text.textContent = '펌웨어가 응답하지않습니다.'
    }
}

module.exports = {


    async init() {
        //----------------------------------------------------------------
        //핸들러
        document.querySelector("#portList").addEventListener('click', function (evt) {

            console.log(evt.target.dataset.path);
            theApp.SerialDeviceName = evt.target.dataset.path;
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

                ipcRenderer.on('serialport-data', async (event, arg) => {
                    // let _data = new TextDecoder().decode(arg);
                    let _data = arg;
                    //check '{' and '}'

                    if (_data[_data.length - 1] == "\r") {
                        //trim \r
                        _data = _data.substring(0, _data.length - 1);
                    }

                    if (_data[0] == '{' && _data[_data.length - 1] == '}') {
                        let _res = JSON.parse(_data);
                        console.log(_res);
                        theApp.resCallback?.(_res);

                        // if (_res.cmd == 'config') {
                        //     theApp.doms.indo_text.textContent = '펌웨어 정보를 읽어오는중.....'
                        //     _loadformDevice();
                        // }
                        // else if (_res.cmd == 'configAll') {
                        //     theApp.doms.indo_text.textContent = '펌웨어 정보를 읽어오는중.....'
                        //     _loadformDevice();
                        // }
                        // else if (_res.cmd == 'configSave') {
                        //     theApp.doms.indo_text.textContent = '펌웨어 정보를 저장하는중.....'
                        //     _loadformDevice();
                        // }

                    }
                    // console.log(_data)
                });

                ipcRenderer.on('serialport-close', (event, arg) => {
                    console.log('serialport-close')
                    theApp.cbSerialClose?.()
                });
                ipcRenderer.on('serialport-open', async (event, arg) => {
                    console.log('serialport-open')
                    theApp.doms.indo_text.textContent = '디바이스 접속완료'
                    await _loadformDevice()

                });

                ipcRenderer.send('connect-serialport', { path: theApp.SerialDeviceName, baudRate: 115200 })


            }
            catch (e) {
                alert(e.message)
                console.log(e)
                document.querySelector("#btn-connect").classList.remove("hide");
                document.querySelector("#btn-close").classList.add("hide");
            }
        });

        document.querySelector('#btn-close').addEventListener('click', async () => {

            ipcRenderer.send('disconnect-serialport')

            theApp.cbSerialClose = () => {
                theApp.doms.indo_text.textContent = 'conection closed'
                //UI내용 모두 지우기
                document.querySelectorAll('.config-form input').forEach(_ => {
                    _.value = ''
                })
                theApp.cbSerialClose = null;

                document.querySelector("#btn-close").classList.add("hide");
                document.querySelector("#btn-connect").classList.remove("hide");

                theApp.SerialDeviceName = ''
                document.querySelector('#select-device-name').innerText = theApp.SerialDeviceName;

            }


            // let _res = await new Promise((resolve, reject) => {

            //     theApp.cbSerialClose = () => {
            //         resolve({ r: 'ok' })
            //         theApp.cbSerialClose = null;
            //     }

            //     // theApp.spObj.close(err => {
            //     //     if (err) {
            //     //         reject({ r: 'err:', err: err })
            //     //     }
            //     // });

            // });

            // if (_res.r == 'ok') {
            //     theApp.doms.indo_text.textContent = 'conection closed'

            //     //UI내용 모두 지우기
            //     document.querySelectorAll('.config-form input').forEach(_ => {
            //         _.value = ''
            //     })

            //     document.querySelector("#btn-close").classList.add("hide");
            //     document.querySelector("#btn-connect").classList.remove("hide");

            //     theApp.SerialDeviceName = ''
            //     document.querySelector('#select-device-name').innerText = theApp.SerialDeviceName;


            // }
            // else {
            //     theApp.doms.indo_text.textContent = 'clode failed'
            // }
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
                if (_res.r == 'ok') {
                    alert('save ok')
                }
                else {
                    alert('save err')
                    // alert(_res.r)
                }
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

            setTimeout(function () {
                location.reload()
            }, 3000)

        });

        try {

            ipcRenderer.send('disconnect-serialport')

            const portListElement = document.querySelector('#portList')

            //clear list element
            while (portListElement.firstChild) {
                portListElement.removeChild(portListElement.firstChild);
            }

            ipcRenderer.on('get-serialport-list-reply', (event, arg) => {
                console.log(arg)

                const _ul = portListElement

                arg.forEach((port) => {
                    const _li = document.createElement('li')
                    _li.innerHTML = port.path
                    _li.setAttribute('data-path', port.path)
                    _ul.appendChild(_li)
                });
            });
            ipcRenderer.send('get-serialport-list')

        }
        catch (e) {
            console.log(e)
            alert('can not get list')
        }

    }

}
