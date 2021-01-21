const serialport = require('serialport');
const Readline = require('@serialport/parser-readline')

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



serialport.list().then(
    ports => {
        ports.forEach(port => {
            let _li = document.createElement('li');
            _li.innerText = port.comName + "(" + port.manufacturer + ")";
            _li.comName = port.comName;

            document.querySelector('#portList').appendChild(_li);

        })
    },
    err => console.error(err)
)


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
        // let _fpw = _objres.fpw / 255
        // document.querySelector("#fire-pwm input").value = ((_fpw.toFixed(4)) * 100).toFixed(2);

        // document.querySelector("#power-down-tick input").value =  _objres.pdt / 1000;
        // document.querySelector("#power-down-delta input").value =  _objres.pdd;

        // document.querySelector("#startup-recover-tick input").value =  _objres.sta / 1000;


        // document.querySelector("#front-stepping-term input").value =  _objres.fst / 1000;


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

    theApp.spObj.write(_cmd, function (err) {
        if (err == undefined) {
            console.log('send cmd')
            // resolve()
        }
        else {
            // reject(err)
            alert(err);

        }
        // alert("save success")
    });

}

async function _loadformDevice() {

    let _res = await new Promise(_dumpConfigAll);

    if (_res.result == 'ok') {
        document.querySelector("#cutoff-term input").value = _res.cth / 1000;
        document.querySelector("#downpluse-term input").value = _res.pd / 1000;

        document.querySelector("#btn-close").classList.remove("hide");

    } else {
        theApp.doms.indo_text.textContent = '펌웨어가 응답하지않습니다.'
    }
}

/*
document.querySelector("#fire-pwm .btn-save").addEventListener('click', function(evt) {
    let _cmd = JSON.stringify({ c: "cs", p1: "fpw", p2: Math.round(this.parentElement.querySelector('input').value / 100 * 255) });
    _cmd += JSON.stringify({ c: "svcfg" });
    _sendCmd(_cmd)
})

document.querySelector("#downpluse-term .btn-save").addEventListener('click', function(evt) {
    let _cmd = JSON.stringify({ c: "cs", p1: "pd", p2: parseInt(this.parentElement.querySelector('input').value) });
    _cmd += JSON.stringify({ c: "svcfg" });
    _sendCmd(_cmd)
})


document.querySelector("#power-down-tick .btn-save").addEventListener('click', function(evt) {
    let _cmd = JSON.stringify({ c: "cs", p1: "pdt", p2: parseInt(this.parentElement.querySelector('input').value) * 1000 });
    _cmd += JSON.stringify({ c: "svcfg" });
    _sendCmd(_cmd)
})

document.querySelector("#power-down-delta .btn-save").addEventListener('click', function(evt) {
    let _cmd = JSON.stringify({
        c: "cs",
        p1: "pdd",
        p2: parseInt(this.parentElement.querySelector('input').value)
    });
    _cmd += JSON.stringify({ c: "svcfg" });
    _sendCmd(_cmd)
})

document.querySelector("#cutoff-term .btn-save").addEventListener('click', function(evt) {
    let _cmd = JSON.stringify({
        c: "cs",
        p1: "cth",
        p2: parseInt(this.parentElement.querySelector('input').value) * 1000
    });
    _cmd += JSON.stringify({ c: "svcfg" });
    _sendCmd(_cmd)
})

document.querySelector("#startup-recover-tick .btn-save").addEventListener('click', function(evt) {
    let _cmd = JSON.stringify({
        c: "cs",
        p1: "sta",
        p2: parseInt(this.parentElement.querySelector('input').value) * 1000
    });
    _cmd += JSON.stringify({ c: "svcfg" });
    _sendCmd(_cmd)
})

document.querySelector("#front-stepping-term .btn-save").addEventListener('click', function(evt) {
    let _cmd = JSON.stringify({
        c: "cs",
        p1: "fst",
        p2: parseInt(this.parentElement.querySelector('input').value) * 1000
    });
    _cmd += JSON.stringify({ c: "svcfg" });
    _sendCmd(_cmd)
})

*/



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
        serialportObj.on("open", function (evt) {

            console.log('open at baudrate :' + theApp.spConfig.baudRate);

            // setTimeout(_dumpConfigAll.bind(this), 2000)

            // //데이터 읽기
            // this.on('data', function(data) {

            // });


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
        theApp.doms.indo_text.textContent = `firm tye :  ${_res.p1[0]} , firm version : ${_res.p1[1]}`
    } else {
        theApp.doms.indo_text.textContent = 'conection failed'
    }

    _loadformDevice()

    // _res = await new Promise(_dumpConfigAll);

    // if (_res.result == 'ok') {
    //     document.querySelector("#cutoff-term input").value = _res.cth / 1000;
    //     document.querySelector("#downpluse-term input").value = _res.pd / 1000;

    //     document.querySelector("#btn-close").classList.remove("hide");

    // } else {
    //     theApp.doms.indo_text.textContent = '펌웨어가 응답하지않습니다.'
    // }
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
    

    await new Promise(async (resolve, reject) => {

        theApp.resCallback = (_objres) => {
            if (_objres.c === 'svcfg') {
                console.log('cmd ok');
                resolve();
            }
        }

        let _cmd = JSON.stringify({ c: "cs", p1: "cth", p2: parseInt(document.querySelector('#cutoff-term input').value) * 1000 }) +
            JSON.stringify({ c: "cs", p1: "pd", p2: parseInt(document.querySelector('#downpluse-term input').value) * 1000 });

        _cmd += JSON.stringify({ c: "svcfg" });
        _sendCmd(_cmd)
    })

    console.log('save ok')


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