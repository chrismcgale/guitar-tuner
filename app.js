const { app, BrowserWindow } = require('electron');

const path = require('path');
const url = require('url');

// keep in global scope
let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 300,
        height: 330,
        resizable: false,
        webPreferences: {
          nodeIntegrationInWorker: true
        }
      })
    
      // Hide the window's menu.
      mainWindow.removeMenu()
    
      // Load the index.html of the app.
      mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      }));
}


// serve window when the app is ready
app.on('ready', createWindow);


// close program when all windows are closed
app.on('window-all-closed', () => app.quit());

// 
app.on('activate', () => {
    if (mainWindow === null) createWindow()
});