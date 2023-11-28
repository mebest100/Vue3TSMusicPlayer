const { app, BrowserWindow, Menu } = require('electron')
const express = require('express')
const path = require('path')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const registerRouter = require('./backend/router')
const cors = require('cors')
// 注意electron-builder打包入口文件引入的依赖都不能放到dev-dependencies里面！因为放到里面就不会被打包！

const port = 9000
const expressApp = express()
expressApp.use(cookieParser())

expressApp.use(cors())

// Register your routes using the provided function
registerRouter(expressApp)

expressApp.use(compression())
expressApp.use(express.static(path.join(__dirname, './dist')))

console.log('Starting Electron process')
// Start Express server
const server = expressApp.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }

  console.log('Express server listening at http://localhost:' + port + '\n')
})

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false // 禁用electron默认样式
      // webSecurity: false
    }
  })

  // 创建自定义菜单
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow.close()
          }
        }
      ]
    }
  ]

  Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(null) // 隐藏顶部菜单

  mainWindow.loadURL(`http://localhost:${port}`)
  // mainWindow.webContents.openDevTools()
}

app.commandLine.appendSwitch('no-sandbox')

app.whenReady().then(() => {
  createWindow()
  // 获取当前 session
  const currentSession = mainWindow.webContents.session

  // 注册请求拦截事件
  currentSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // 修改请求头部信息
    details.requestHeaders['user-agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.69'

    // 调用回调函数，继续请求
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
