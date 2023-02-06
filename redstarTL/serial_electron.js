const { ipcMain } = require('electron')
const { SerialPort, ReadlineParser } = require('serialport');


module.exports = function () {

    ipcMain.on('get-serialport-list', async (event, arg) => {
        const list = await SerialPort.list()
        console.log(list)
        event.reply('get-serialport-list-reply', list)
    });

    let port = null;
    ipcMain.on('connect-serialport', async (event, arg) => {
        port = new SerialPort({ path: arg.path, baudRate: arg.baudRate })
        const parser = new ReadlineParser({ delimiter: '\r\n' })
        port.pipe(parser)
        port.on('open', () => {
            console.log('serial port open')
            event.reply('serialport-open')
        });

        port.on('close', () => {
            console.log('serial port close')
            event.reply('serialport-close')
        });

        parser.on('data', (data) => {
            console.log(data)
            event.reply('serialport-data', data)
        });

    });

    ipcMain.on('disconnect-serialport', async (event, arg) => {
        console.log('disconnect serialport')

        if (port) {
            port.close();
            port = null;
        }
    });

    ipcMain.on('sendData', async (event, arg) => {
        console.log('sendData')
        console.log(arg)
        if (port) {
            port.write(arg);
        }
    });

    console.log('init sertialport')
}