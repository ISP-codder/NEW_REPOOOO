// 1. Добавьте session в деструктуризацию
const { app, BrowserWindow, ipcMain, dialog, session } = require('electron')
const path = require('path')

function createWindow() {
	const win = new BrowserWindow({
		width: 1200,
		height: 900,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	})

	win.loadFile('index.html')
}

app.whenReady().then(createWindow)

// 2. Исправленная логика закрытия
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

ipcMain.handle('save-dialog', async (event, suggestedName) => {
	const { filePath } = await dialog.showSaveDialog({
		title: 'Выберите место для сохранения документа',
		defaultPath: suggestedName,
		filters: [{ name: 'Word Documents', extensions: ['docx'] }]
	})
	return filePath
})
