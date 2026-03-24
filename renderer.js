const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

// --- ИМПОРТЫ СЕРВИСОВ ---
// Используем относительные пути от renderer.js до твоих файлов
const DocGenerator = require('./src/services/docGenerator')
const claimTemplate = require('./src/templates/claimTemplate')
const lawsuitTemplate = require('./src/templates/lawsuitTemplate')

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
async function getFileBuffer(id) {
	const input = document.getElementById(id)
	if (!input || !input.files[0]) return null
	return Buffer.from(await input.files[0].arrayBuffer())
}

function setupOnlyLetters(id) {
	const el = document.getElementById(id)
	if (!el) return
	el.addEventListener('input', e => {
		const clean = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s\-]/g, '')
		if (e.target.value !== clean) e.target.value = clean
	})
}

function showError(message) {
	const toast = document.getElementById('errorToast')
	if (!toast) {
		alert(message)
		return
	}
	toast.innerText = message
	toast.style.display = 'block'
	setTimeout(() => {
		toast.style.display = 'none'
	}, 3000)
}

function validateForm(container) {
	let isValid = true
	let firstInvalidInput = null

	const inputs = container.querySelectorAll('input[required], .required-field')
	// Если у тебя нет атрибутов required, можно проверять все текстовые:
	const textInputs = container.querySelectorAll(
		'input[type="text"], input[type="date"]'
	)

	textInputs.forEach(input => {
		input.classList.remove('invalid')
		if (!input.value.trim()) {
			input.classList.add('invalid')
			isValid = false
			if (!firstInvalidInput) firstInvalidInput = input
		}
	})

	return isValid
}

// --- УПРАВЛЕНИЕ ВКЛАДКАМИ (ОБЪЯВЛЯЕМ ДО ВЫЗОВА) ---
async function loadView(viewName) {
	const container = document.getElementById('content-viewport')
	// Исправляем путь: renderer.js лежит в корне, а вьюхи в src/views
	const viewPath = path.join(__dirname, 'src', 'views', `${viewName}.html`)

	if (!fs.existsSync(viewPath)) {
		container.innerHTML = `<h2>Вкладка ${viewName} не найдена по пути ${viewPath}</h2>`
		return
	}

	const html = fs.readFileSync(viewPath, 'utf8')
	container.innerHTML = html

	// Инициализация логики конкретной страницы
	if (viewName === 'claims') {
		initClaimsLogic()
	} else if (viewName === 'lawsuits') {
		initLawsuitLogic()
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
				purchaseDate: document.getElementById('purchaseDate').value,
				productCategory: document.getElementById('productCategory').value,
				// Добавляем недостающие поля для новой структуры [cite: 26, 27]
				sellerOgrn: document.getElementById('sellerOgrn')?.value || '',
				sellerLegalAddress:
					document.getElementById('sellerLegalAddress')?.value || '',
				tmNumbers: document.getElementById('tmNumbers')?.value || '',
				plaintiffName: 'Пума СЕ' // Из примера [cite: 33]
			}

			const photos = {}
			const prodPhoto = await getFileBuffer('productPhotoInput')
			if (prodPhoto) photos['ФОТО ТОВАРА'] = prodPhoto

			const recPhoto = await getFileBuffer('receiptPhotoInput')
			if (recPhoto) photos['ФОТО ЧЕКА'] = recPhoto

			// Вызов генерации (теперь передаем объект с headers и children)
			const templateResult = await claimTemplate(data, photos)
			const buf = await DocGenerator.createDocument(
				await claimTemplate(data, photos),
				'claim'
			)

			const savePath = await ipcRenderer.invoke(
				'save-dialog',
				`Претензия_${data.sellerInn}.docx`
			)
			if (savePath) {
				fs.writeFileSync(savePath, buf)
			}
		} catch (e) {
			console.error(e)
			alert('Ошибка: ' + e.message)
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
		if (!validateForm(cont)) return

		try {
			btn.disabled = true
			const data = {
				courtName: document.getElementById('courtNameLawsuit').value,
				courtAddress: document.getElementById('courtAddress').value,
				plaintiffName: document.getElementById('plaintiff').value,
				sellerName: document.getElementById('sellerNameLawsuit').value,
				sellerInn: document.getElementById('sellerInnLawsuit').value,
				sellerOgrn: document.getElementById('sellerOgrnLawsuit').value,
				sellerLegalAddress: document.getElementById('sellerAddressLawsuit')
					.value,
				purchaseDate: document.getElementById('purchaseDateLawsuit').value,
				productType: document.getElementById('categoryLawsuit').value,
				tmNumber: document.getElementById('tmLawsuit').value
			}

			const photos = {}
			const prodPhoto = await getFileBuffer('productPhotoInputLawsuit')
			if (prodPhoto) photos['ФОТО ТОВАРА'] = prodPhoto

			const templateResult = await lawsuitTemplate(data, photos)
			const buf = await DocGenerator.createDocument(
				await lawsuitTemplate(data, photos),
				'lawsuit'
			)

			const savePath = await ipcRenderer.invoke(
				'save-dialog',
				`Иск_${data.sellerName}.docx`
			)
			if (savePath) fs.writeFileSync(savePath, buf)
		} catch (e) {
			alert(e.message)
		} finally {
			btn.disabled = false
		}
	}
}

// --- ГЛОБАЛЬНЫЙ ЗАПУСК ---
// Сначала экспортируем в window, чтобы HTML видел функцию
window.loadView = loadView

// Затем запускаем стартовую вьюху
window.addEventListener('DOMContentLoaded', () => {
	loadView('claims')
})
