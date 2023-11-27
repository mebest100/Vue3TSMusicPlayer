const { app, BrowserWindow, Menu } = require('electron')
const express = require('express')
const path = require('path')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const csrf = require('xsrf')
const registerRouter = require('./backend/router')
// 注意electron-builder打包入口文件引入的依赖都不能放到dev-dependencies里面！因为放到里面就不会被打包！

const port = 9000
const expressApp = express()

// Your existing Express server setup
const csrfProtection = csrf({
  cookie: true,
  ignoreMethods: ['HEAD', 'OPTIONS'],
  checkPathReg: /^\/api/
})
expressApp.use(cookieParser())
expressApp.use(csrfProtection)

expressApp.get('/', function (req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken())
  return next()
})

// Register your routes using the provided function
registerRouter(expressApp)

expressApp.use(compression())
expressApp.use(express.static(path.join(__dirname, './dist')))

expressApp.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next()
  }

  res.status(403)
  res.send('<p>接口已经被我用 CSRF 保护了，请使用自己的服务器代理接口</p>')
})

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
    width: 800,
    height: 600,
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
  mainWindow.webContents.openDevTools()
}

app.commandLine.appendSwitch('no-sandbox')

app.whenReady().then(() => {
  createWindow()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
