const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

// При каждом запуске сбрасываем флаг авторизации, чтобы требовать пароль,
// но сам пароль в localStorage не трогаем.
localStorage.removeItem('is_authenticated')

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
		// Передаем функции уведомлений в сервис авторизации
		AuthService.renderLogin(viewport, initApp, window.showError)
	}
}

// --- НАВИГАЦИЯ И ЗАГРУЗКА ВЬЮХ ---
async function loadView(viewName) {
	// Исключение для страницы восстановления пароля (доступна без логина)
	if (!AuthService.check() && viewName !== 'forgot-password') {
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

	// Инициализация логики для каждой конкретной вкладки
	const logicMap = {
		'forgot-password': () => {
			const RecoveryService = require('./src/services/forgotPassword')
			// Передаем showError и showSuccess для красивых уведомлений
			RecoveryService.init(window.showError, window.showSuccess)
		},
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

// --- УВЕДОМЛЕНИЯ (TOASTS) ---
function showToast(message, type = 'error') {
	const toast = document.getElementById('errorToast')
	if (!toast) {
		console.log(`${type.toUpperCase()}: ${message}`)
		return
	}

	toast.innerText = message
	toast.style.display = 'block'
	toast.style.opacity = '1'

	// Зеленый для успеха, Бордовый для ошибок ЮК ШИП
	if (type === 'success') {
		toast.style.backgroundColor = '#28a745'
	} else {
		toast.style.backgroundColor = '#731a20'
	}

	// Плавное исчезновение через 3 секунды
	setTimeout(() => {
		toast.style.transition = 'opacity 0.5s'
		toast.style.opacity = '0'
		setTimeout(() => {
			toast.style.display = 'none'
			toast.style.opacity = '1'
		}, 500)
	}, 3000)
}

window.showError = msg => showToast(msg, 'error')
window.showSuccess = msg => showToast(msg, 'success')

// --- ВАЛИДАЦИЯ ФОРМ ---
function validateForm(container) {
	let isValid = true
	const inputs = container.querySelectorAll(
		'input[type="text"], input[type="date"], input[type="number"]'
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
		const firstError = container.querySelector('.invalid')
		if (firstError) firstError.focus()
	}
	return isValid
}

function setupInputValidationCleanup() {
	document.addEventListener('input', e => {
		if (e.target.tagName === 'INPUT') {
			e.target.classList.remove('invalid')
		}
	})
	document.addEventListener('change', e => {
		if (e.target.type === 'file') {
			const box = e.target.closest('.photo-box')
			if (box) box.style.border = '2px solid lightGreen' // Убираем красную рамку
		}
	})
}

async function getFileBuffer(id) {
	const input = document.getElementById(id)
	if (!input || !input.files[0]) return null
	return Buffer.from(await input.files[0].arrayBuffer())
}

// --- ЛОГИКА ПРЕТЕНЗИЙ ---
// --- ЛОГИКА ПРЕТЕНЗИЙ (ИСПРАВЛЕННАЯ) ---
function initClaimsLogic() {
	const btn = document.getElementById('generateClaimsBtn')
	if (!btn) return

	btn.onclick = async () => {
		const cont = document.getElementById('content-viewport')

		// 1. Сначала стандартная проверка текстовых полей
		if (!validateForm(cont)) {
			showError('Заполните все текстовые поля')
			return
		}

		// 2. ПРОВЕРКА ФОТО (Твоя правка здесь)
		const prodPhotoInput = document.getElementById('productPhotoInput')
		const receiptPhotoInput = document.getElementById('receiptPhotoInput')

		if (!prodPhotoInput?.files?.[0]) {
			const box = prodPhotoInput.closest('.photo-box')
			if (box) box.style.border = '2px dashed #731a20'
			showError('Обязательно выберите фото товара!')
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
				productQuantity: document.getElementById('productCount').value,
				trademark: document.getElementById('trademark').value,
				plaintiffName: document.getElementById('rightHolder').value
			}

			const photos = {}
			const prodPhoto = await getFileBuffer('productPhotoInput')
			if (prodPhoto) photos['Фото товара'] = prodPhoto

			const recPhoto = await getFileBuffer('receiptPhotoInput')
			if (recPhoto) photos['Фото чека'] = recPhoto

			const children = await claimTemplate(data, photos)
			const buf = await DocGenerator.createDocument(children)

			const fileName = `Претензия_${data.sellerInn}.docx`
			const savePath = await ipcRenderer.invoke('save-dialog', fileName)

			if (savePath) {
				fs.writeFileSync(savePath, buf)
				window.showSuccess(`Документ "${fileName}" успешно создан!`)
			}
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

			const children = await lawsuitTemplate(data, photos)
			const buf = await DocGenerator.createDocument(children)

			const fileName = `Иск_${data.sellerName.replace(/["']/g, '')}.docx`
			const savePath = await ipcRenderer.invoke('save-dialog', fileName)

			if (savePath) {
				fs.writeFileSync(savePath, buf)
				window.showSuccess(`Документ "${fileName}" успешно создан!`)
			}
		} catch (e) {
			showError('Ошибка: ' + e.message)
		} finally {
			btn.disabled = false
		}
	}
}

// --- ЛОГИКА ОТЧЕТОВ ---
function initReportLogic() {
	const btn = document.getElementById('generateBtn')
	if (!btn) return

	btn.onclick = async () => {
		const cont = document.getElementById('content-viewport')
		if (!validateForm(cont)) {
			showError('Пожалуйста, заполните все поля отчета')
			return
		}

		try {
			btn.disabled = true
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

			const fileName = `Отчет_за_${data.reportDate.replace(/-/g, '_')}.docx`
			const savePath = await ipcRenderer.invoke('save-dialog', fileName)

			if (savePath) {
				fs.writeFileSync(savePath, buf)
				window.showSuccess(`Отчет за ${data.reportDate} успешно создан!`)
			}
		} catch (e) {
			showError('Ошибка генерации: ' + e.message)
		} finally {
			btn.disabled = false
		}
	}
}

// --- ЛОГИКА УВЕДОМЛЕНИЙ ---
function initNoticeLogic() {
	const btn = document.getElementById('generateBtn')
	if (!btn) return

	btn.onclick = async () => {
		const cont = document.getElementById('content-viewport')
		if (!validateForm(cont)) {
			showError('Заполните все поля уведомления')
			return
		}

		try {
			btn.disabled = true
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

			const children = await noticeTemplate(data, {})
			const buf = await DocGenerator.createDocument(children)

			const fileName = `Уведомление_${data.sellerName.replace(/["']/g, '')}.docx`
			const savePath = await ipcRenderer.invoke('save-dialog', fileName)

			if (savePath) {
				fs.writeFileSync(savePath, buf)
				window.showSuccess(`Уведомление для "${data.sellerName}" создано!`)
			}
		} catch (e) {
			showError('Ошибка: ' + e.message)
		} finally {
			btn.disabled = false
		}
	}
}

// --- ЛОГИКА МИРОВЫХ СОГЛАШЕНИЙ ---
function initSettlementLogic() {
	const btn = document.getElementById('generateBtn')
	if (!btn) return

	btn.onclick = async () => {
		const cont = document.getElementById('content-viewport')
		if (!validateForm(cont)) {
			showError('Заполните все поля мирового соглашения')
			return
		}

		try {
			btn.disabled = true
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

			const children = await settlementTemplate(data)
			const buf = await DocGenerator.createDocument(children)

			const fileName = `Мировое_соглашение_${data.defendantName.replace(/["']/g, '')}.docx`
			const savePath = await ipcRenderer.invoke('save-dialog', fileName)

			if (savePath) {
				fs.writeFileSync(savePath, buf)
				window.showSuccess(
					`Мировое соглашение с "${data.defendantName}" создано!`
				)
			}
		} catch (e) {
			showError('Ошибка: ' + e.message)
		} finally {
			btn.disabled = false
		}
	}
}

// Делаем функцию доступной глобально для AuthService и ссылок
window.loadView = loadView
