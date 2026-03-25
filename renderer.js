const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

// --- ИМПОРТЫ СЕРВИСОВ ---
const DocGenerator = require('./src/services/docGenerator')
const AuthService = require('./src/services/authService')

const claimTemplate = require('./src/templates/claimTemplate')
const lawsuitTemplate = require('./src/templates/lawsuitTemplate')
const reportTemplate = require('./src/templates/reportTemplate')
const noticeTemplate = require('./src/templates/noticeTemplate')
const settlementTemplate = require('./src/templates/settlementTemplate')

document.addEventListener('DOMContentLoaded', () => {
	initApp()
	setupInputValidationCleanup()
})

function initApp() {
	if (AuthService.check()) {
		document.body.classList.add('authenticated')
		loadView('claims')
	} else {
		document.body.classList.remove('authenticated')
		const viewport = document.getElementById('content-viewport')
		AuthService.renderLogin(viewport, initApp, showError)
	}
}

// Измененная функция loadView
async function loadView(viewName) {
	if (!AuthService.check()) {
		initApp()
		return
	}

	const container = document.getElementById('content-viewport')
	const viewPath = path.join(__dirname, 'src', 'views', `${viewName}.html`)

	if (!fs.existsSync(viewPath)) {
		container.innerHTML = `<h2>Вкладка ${viewName} не найдена</h2>`
		return
	}

	container.innerHTML = fs.readFileSync(viewPath, 'utf8')

	// Инициализация логики в зависимости от вкладки
	const logicMap = {
		claims: initClaimsLogic,
		lawsuits: initLawsuitLogic,
		reports: initReportLogic,
		notices: initNoticeLogic,
		settlements: initSettlementLogic
	}

	if (logicMap[viewName]) {
		logicMap[viewName]()
	}
}

function setupInputValidationCleanup() {
	document.addEventListener('input', e => {
		if (e.target.tagName === 'INPUT') {
			// Убираем класс ошибки, как только пользователь начал вводить текст
			e.target.classList.remove('invalid')

			// Если была глобальная ошибка (toast), можно её тоже скрыть
			const toast = document.getElementById('errorToast')
			if (toast) toast.style.display = 'none'
		}
	})
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
async function getFileBuffer(id) {
	const input = document.getElementById(id)
	if (!input || !input.files[0]) return null
	return Buffer.from(await input.files[0].arrayBuffer())
}

function showError(message) {
	const toast = document.getElementById('errorToast')
	if (!toast) {
		console.error(message)
		return
	}

	toast.innerText = message
	toast.style.display = 'block'

	// Плавное скрытие через 3 секунды
	setTimeout(() => {
		toast.style.display = 'none'
	}, 3000)
}

function validateForm(container) {
	let isValid = true
	const inputs = container.querySelectorAll(
		'input[type="text"], input[type="date"]'
	)

	inputs.forEach(input => {
		if (!input.value.trim()) {
			input.classList.add('invalid')
			isValid = false
		} else {
			input.classList.remove('invalid')
		}
	})

	if (!isValid) {
		// Находим первое пустое поле и принудительно ставим на него фокус
		const firstError = container.querySelector('.invalid')
		if (firstError) {
			firstError.focus()
		}
	}

	return isValid
}

// --- ЛОГИКА ПРЕТЕНЗИЙ ---
function initClaimsLogic() {
	const btn = document.getElementById('generateClaimsBtn')
	if (!btn) return

	btn.onclick = async () => {
		const cont = document.getElementById('content-viewport')
		if (!validateForm(cont)) {
			showError('Заполните все поля')
			return
		}

		try {
			btn.disabled = true
			const data = {
				shopName: document.getElementById('shopName').value,
				shopLocation: document.getElementById('shopLocation').value,
				shopStreet: document.getElementById('shopStreet').value,
				sellerName: document.getElementById('sellerName').value,
				sellerInn: document.getElementById('sellerInn').value,
				sellerOgrn: document.getElementById('sellerOgrn').value,
				sellerLegalAddress: document.getElementById('sellerLegalAddress').value,
				purchaseDate: document.getElementById('purchaseDate').value,
				productCategory: document.getElementById('productCategory').value,
				productPrice: document.getElementById('productPrice').value,
				productCount: document.getElementById('productCount').value,
				tmNumbers: document.getElementById('trademark').value,
				plaintiffName: document.getElementById('rightHolder').value
			}

			const photos = {}
			const prodPhoto = await getFileBuffer('productPhotoInput')
			if (prodPhoto) photos['ФОТО ТОВАРА'] = prodPhoto
			const recPhoto = await getFileBuffer('receiptPhotoInput')
			if (recPhoto) photos['ФОТО ЧЕКА'] = recPhoto

			// ГЕНЕРАЦИЯ
			const children = await claimTemplate(data, photos)
			const buf = await DocGenerator.createDocument(children)

			const savePath = await ipcRenderer.invoke(
				'save-dialog',
				`Претензия_${data.sellerInn}.docx`
			)
			if (savePath) fs.writeFileSync(savePath, buf)
		} catch (e) {
			console.error(e)
			showError('Ошибка: ' + e.message)
		} finally {
			btn.disabled = false
		}
	}
}

// --- ЛОГИКА ИСКОВ ---
function initLawsuitLogic() {
	const btn = document.getElementById('generateLawsuitBtn')
	if (!btn) return

	btn.onclick = async () => {
		const cont = document.getElementById('content-viewport')
		if (!validateForm(cont)) {
			showError('Заполните все поля')
			return
		}

		try {
			btn.disabled = true
			// ID приведены в соответствие с твоей версткой "Исков"
			const data = {
				courtName: document.getElementById('courtName').value,
				courtAddress: document.getElementById('courtAddress').value,
				plaintiffName: document.getElementById('plaintiffName').value,
				representativeName: document.getElementById('representativeName').value,
				shopName: document.getElementById('shopName').value,
				shopLocation: document.getElementById('shopLocation').value,
				shopStreet: document.getElementById('shopStreet').value,
				sellerName: document.getElementById('sellerName').value,
				sellerInn: document.getElementById('sellerInn').value,
				sellerOgrn: document.getElementById('sellerOgrn').value,
				sellerLegalAddress: document.getElementById('sellerLegalAddress').value,
				purchaseDate: document.getElementById('purchaseDate').value,
				productCategory: document.getElementById('productCategory').value,
				productPrice: document.getElementById('productPrice').value,
				productCount: document.getElementById('productCount').value,
				tmNumbers: document.getElementById('trademark').value
			}

			const photos = {}
			const prodPhoto = await getFileBuffer('productPhotoInput')
			if (prodPhoto) photos['ФОТО ТОВАРА'] = prodPhoto
			const recPhoto = await getFileBuffer('receiptPhotoInput')
			if (recPhoto) photos['ФОТО ЧЕКА'] = recPhoto

			// ГЕНЕРАЦИЯ
			const children = await lawsuitTemplate(data, photos)
			const buf = await DocGenerator.createDocument(children)

			const savePath = await ipcRenderer.invoke(
				'save-dialog',
				`Иск_${data.sellerName}.docx`
			)
			if (savePath) fs.writeFileSync(savePath, buf)
		} catch (e) {
			console.error(e)
			showError('Ошибка: ' + e.message)
		} finally {
			btn.disabled = false
		}
	}
}

function initReportLogic() {
	// 1. Ищем кнопку по ID, который указан в HTML
	const btn = document.getElementById('generateBtn')
	if (!btn) return

	btn.onclick = async () => {
		const cont = document.getElementById('content-viewport')

		// 2. ВАЖНО: Обновляем validateForm, чтобы она видела и type="number"
		if (!validateReportForm(cont)) {
			showError('Пожалуйста, заполните все поля отчета')
			return
		}

		try {
			btn.disabled = true
			btn.innerText = 'Генерация...'

			// 3. Сопоставляем ID строго по вашему HTML (reportDate, settlementsCount и т.д.)
			const data = {
				reportDate: document.getElementById('reportDate').value,
				settlementsCount: document.getElementById('settlementsCount').value,
				claimsCount: document.getElementById('claimsToCourtCount').value,
				lawsuitsCount: document.getElementById('lawsuitsToCourtCount').value,
				lostCount: document.getElementById('lossesCount').value,
				wonCount: document.getElementById('winsCount').value,
				settlementsSum: document.getElementById('settlementsAmount').value,
				compensationSum: document.getElementById('moralCompensationAmount')
					.value,
				totalProfit: document.getElementById('monthlyProfit').value
			}

			const children = await reportTemplate(data)
			const buf = await DocGenerator.createDocument(children)

			const savePath = await ipcRenderer.invoke(
				'save-dialog',
				`Отчет_за_${data.reportDate.replace(/-/g, '_')}.docx`
			)

			if (savePath) {
				fs.writeFileSync(savePath, buf)
			}
		} catch (e) {
			console.error(e)
			showError('Ошибка генерации: ' + e.message)
		} finally {
			btn.disabled = false
			btn.innerText = 'Сгенерировать'
		}
	}
}

// Вспомогательная функция валидации специально для отчетов (включая числа)
function validateReportForm(container) {
	let isValid = true
	const inputs = container.querySelectorAll('input') // Проверяем все инпуты во вьюхе

	inputs.forEach(input => {
		if (!input.value.trim()) {
			input.classList.add('invalid')
			isValid = false
		} else {
			input.classList.remove('invalid')
		}
	})

	if (!isValid) {
		const firstError = container.querySelector('.invalid')
		if (firstError) firstError.focus()
	}
	return isValid
}

// --- ЛОГИКА УВЕДОМЛЕНИЙ ---
function initNoticeLogic() {
	const btn = document.getElementById('generateBtn') // ID кнопки из нашей верстки
	if (!btn) return

	btn.onclick = async () => {
		const cont = document.getElementById('content-viewport')

		// Валидация всех полей ввода
		if (!validateForm(cont)) {
			showError('Заполните все поля уведомления')
			return
		}

		try {
			btn.disabled = true
			btn.innerText = 'Генерация...'

			// Сбор данных из полей (используем ID из созданного HTML)
			const data = {
				shopName: document.getElementById('shopName').value,
				shopLocation: document.getElementById('shopLocation').value,
				shopStreet: document.getElementById('shopStreet').value,
				sellerName: document.getElementById('sellerName').value,
				sellerOgrn: document.getElementById('sellerOgrn').value,
				sellerInn: document.getElementById('sellerInn').value,
				sellerLegalAddress: document.getElementById('sellerLegalAddress').value,
				purchaseDate: document.getElementById('purchaseDate').value,
				trademark: document.getElementById('trademark').value,
				rightHolder: document.getElementById('rightHolder').value,
				compensationAmount: document.getElementById('compensationAmount').value,
				preTrialCompensation: document.getElementById('preTrialCompensation')
					.value
			}

			// Уведомление обычно не требует фото товара, но если нужно — можно добавить по аналогии с претензиями
			const photos = {}

			// ГЕНЕРАЦИЯ с использованием созданного ранее шаблона
			const children = await noticeTemplate(data, photos)
			const buf = await DocGenerator.createDocument(children)

			// Вызов диалога сохранения через IPC Electron
			const savePath = await ipcRenderer.invoke(
				'save-dialog',
				`Уведомление_${data.sellerName.replace(/["']/g, '')}.docx`
			)

			if (savePath) {
				fs.writeFileSync(savePath, buf)
			}
		} catch (e) {
			console.error(e)
			showError('Ошибка при генерации уведомления: ' + e.message)
		} finally {
			btn.disabled = false
			btn.innerText = 'Сгенерировать'
		}
	}
}

function initSettlementLogic() {
	const btn = document.getElementById('generateBtn')
	if (!btn) return

	btn.onclick = async () => {
		const cont = document.getElementById('content-viewport')

		// Валидация: проверяем, чтобы все текстовые поля были заполнены
		if (!validateForm(cont)) {
			showError('Заполните все поля мирового соглашения')
			return
		}

		try {
			btn.disabled = true
			btn.innerText = 'Генерация...'

			// Сбор данных из полей (ID соответствуют верстке)
			const data = {
				courtName: document.getElementById('courtName').value,
				plaintiffName: document.getElementById('plaintiffName').value,
				defendantName: document.getElementById('defendantName').value,
				courtAddress: document.getElementById('courtAddress').value,
				trademark: document.getElementById('trademarkSettlement').value,
				amount: document.getElementById('settlementSum').value,
				deadline: document.getElementById('paymentDeadline').value,
				date: document.getElementById('settlementDate').value
			}

			// 1. Создаем структуру документа через шаблон
			const children = await settlementTemplate(data)

			// 2. Генерируем Buffer (DocGenerator уже настроен на разные колонтитулы)
			const buf = await DocGenerator.createDocument(children)

			// 3. Диалог сохранения файла
			const savePath = await ipcRenderer.invoke(
				'save-dialog',
				`Мировое_соглашение_${data.defendantName.replace(/["']/g, '')}.docx`
			)

			if (savePath) {
				fs.writeFileSync(savePath, buf)
			}
		} catch (e) {
			console.error(e)
			showError('Ошибка при генерации: ' + e.message)
		} finally {
			btn.disabled = false
			btn.innerText = 'Сгенерировать'
		}
	}
}

// --- ГЛОБАЛЬНЫЙ ЗАПУСК ---
window.loadView = loadView
