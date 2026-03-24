const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

// --- ИМПОРТЫ СЕРВИСОВ ---
const DocGenerator = require('./src/services/docGenerator')
const claimTemplate = require('./src/templates/claimTemplate')
const lawsuitTemplate = require('./src/templates/lawsuitTemplate')
const reportTemplate = require('./src/templates/reportTemplate')

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
async function getFileBuffer(id) {
	const input = document.getElementById(id)
	if (!input || !input.files[0]) return null
	return Buffer.from(await input.files[0].arrayBuffer())
}

function showError(message) {
	alert(message) // Можно заменить на красивый Toast, если он есть в HTML
}

function validateForm(container) {
	let isValid = true
	const textInputs = container.querySelectorAll(
		'input[type="text"], input[type="date"], input[type="number"]'
	)

	textInputs.forEach(input => {
		input.classList.remove('invalid')
		if (!input.value.trim()) {
			input.classList.add('invalid')
			isValid = false
		}
	})
	return isValid
}

// --- УПРАВЛЕНИЕ ВКЛАДКАМИ ---
async function loadView(viewName) {
	const container = document.getElementById('content-viewport')
	// Путь к файлам вьюх (src/views/claims.html и т.д.)
	const viewPath = path.join(__dirname, 'src', 'views', `${viewName}.html`)

	if (!fs.existsSync(viewPath)) {
		container.innerHTML = `<h2>Вкладка ${viewName} не найдена</h2>`
		return
	}

	container.innerHTML = fs.readFileSync(viewPath, 'utf8')

	// Инициализация логики
	if (viewName === 'claims') {
		initClaimsLogic()
	} else if (viewName === 'lawsuits') {
		initLawsuitLogic()
	} else if (viewName === 'reports') {
		// Добавлено
		initReportLogic()
	}
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
	const btn = document.querySelector('.btn-generate')
	if (!btn) return

	btn.onclick = async () => {
		const cont = document.getElementById('content-viewport')

		if (!validateForm(cont)) {
			showError('Пожалуйста, заполните все поля отчета')
			return
		}

		try {
			btn.disabled = true
			btn.innerText = 'Генерация...'

			// Сопоставляем ID из HTML (lost-cases) с ключами для шаблона (lostCount)
			const data = {
				reportDate: document.getElementById('report-date').value,
				settlementsCount: document.getElementById('settlements-count').value,
				claimsCount: document.getElementById('claims-count').value,
				lawsuitsCount: document.getElementById('lawsuits-count').value,
				lostCount: document.getElementById('lost-cases').value, // Исправлено
				wonCount: document.getElementById('won-cases').value, // Исправлено
				settlementsSum: document.getElementById('settlements-sum').value,
				compensationSum: document.getElementById('compensation-sum').value,
				totalProfit: document.getElementById('monthly-profit').value // Исправлено
			}

			const children = await reportTemplate(data)
			const buf = await DocGenerator.createDocument(children)

			const savePath = await ipcRenderer.invoke(
				'save-dialog',
				`Отчет_за_${data.reportDate.replace(/\./g, '_')}.docx`
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

// --- ГЛОБАЛЬНЫЙ ЗАПУСК ---
window.loadView = loadView

window.addEventListener('DOMContentLoaded', () => {
	loadView('claims')
})
