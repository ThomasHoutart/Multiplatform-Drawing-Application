/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable max-lines-per-function */
// heavely inspired from https://www.sitepoint.com/build-a-desktop-application-with-electron-and-angular/
var eventSender = null;
const { app, BrowserWindow, ipcMain } = require('electron')
const url = require("url");
const path = require("path");

let mainWindow;
let chatWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        resizable: false,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        },
        icon: path.join(__dirname, `../assets/Images/DrawHub_Icon.svg`),
    })

    mainWindow.maximize();

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `../../dist/index.html`),
            protocol: "file:",
            slashes: true
        }),
    );

    mainWindow.on('closed', () => {
        mainWindow = null
        chatWindow = null
    });
}

function createChatWindow() {
    chatWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true
        },
        icon: path.join(__dirname, `../assets/Images/DrawHub_Icon.svg`)
    })

    chatWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `../../dist/index.html`),
            protocol: "file:",
            slashes: true,
            hash: "chat"
        })
    );

    chatWindow.on('closed', () => {
        chatWindow = null
        eventSender.send('close-chat-window', "INTEGRATED");
    })
}
app.on('ready', createMainWindow)

app.on('window-all-closed', () => {
    app.quit()
});

app.on('activate', () => {
    if (mainWindow == null) createMainWindow()

})
ipcMain.on('open-chat-window', (event, arg) => {
    eventSender = event.sender;
    if (chatWindow == null) {
        createChatWindow();
    }
});
