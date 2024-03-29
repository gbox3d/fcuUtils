// Modules to control application life and create native browser window
const {app, BrowserWindow , ipcMai,dialog, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')

// const serialport = require('serialport');
// const Readline = require('@serialport/parser-readline')
// const { contextBridge, ipcRenderer } = require('electron')



function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, './preload.js')
    }
  })

  // ipcMain.handle('ping', () => 'pong')

  //serialport setup
  require('./serial_electron.js')();

  ipcMain.on('show-open-dialog', (event, arg) => {
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then(result => {
      console.log(result.canceled)
      console.log(result.filePaths)
      event.reply('show-open-dialog-reply', result.filePaths)
    }).catch(err => {
      console.log(err)
    })
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Make the following changes in main.js
app.whenReady(() => {
  app.allowRendererProcessReuse = false
})