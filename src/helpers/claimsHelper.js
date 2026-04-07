// claimsHelper.js - версия для Electron
;(function () {
	console.log('claimsHelper.js загружен') // Для отладки

	// Функция инициализации
	function initPhotoHandlers() {
		console.log('Инициализация обработчиков фото...')

		// Находим все контейнеры с фотографиями
		const photoBoxes = document.querySelectorAll('.photo-box')
		console.log('Найдено photo-box:', photoBoxes.length)

		if (photoBoxes.length === 0) {
			console.log('photo-box не найдены, возможно DOM еще не загружен')
			return
		}

		photoBoxes.forEach((box, index) => {
			console.log(`Обработка photo-box ${index + 1}`)

			// Находим input type="file" внутри контейнера
			const fileInput = box.querySelector('input[type="file"]')
			if (!fileInput) {
				console.log(`В photo-box ${index + 1} не найден input`)
				return
			}

			console.log(`Input найден, id: ${fileInput.id || 'без id'}`)

			// Создаем или находим элемент для отображения статуса
			let statusDiv = box.querySelector('.photo-status')
			if (!statusDiv) {
				statusDiv = document.createElement('div')
				statusDiv.className = 'photo-status'
				statusDiv.textContent = 'Вы выбрали фото'
				statusDiv.style.cssText = `
                    margin-top: 10px;
                    padding: 5px;
                    background-color: #e8f5e9;
                    color: #2e7d32;
                    border-radius: 4px;
                    font-size: 12px;
                    text-align: center;
                    display: none;
                `
				box.appendChild(statusDiv)
				console.log(`Создан statusDiv для photo-box ${index + 1}`)
			}

			// Функция обновления статуса
			function updateStatus() {
				console.log(`Обновление статуса для ${fileInput.id || 'input'}`)
				if (fileInput.files && fileInput.files.length > 0) {
					console.log(`Файл выбран: ${fileInput.files[0].name}`)
					statusDiv.textContent = '✓ Вы выбрали фото'
					statusDiv.style.display = 'block'
					box.classList.add('has-file')

					// Дополнительно: меняем стиль рамки
					box.style.border = '2px solid #4caf50'
					box.style.backgroundColor = '#e8f5e9'
				} else {
					console.log('Файл не выбран')
					statusDiv.style.display = 'none'
					box.classList.remove('has-file')
					box.style.border = '2px solid black'
					box.style.backgroundColor = '#fff'
				}
			}

			// Обработчик изменения выбора файла
			fileInput.addEventListener('change', updateStatus)

			// Обработчик клика на контейнере
			box.addEventListener('click', function (e) {
				// Если клик не по самому input (который прозрачный)
				if (e.target !== fileInput) {
					console.log('Клик по контейнеру, открываем выбор файла')
					fileInput.click()
				}
			})

			// Начальная проверка
			updateStatus()
		})
	}

	// Ждем загрузки DOM
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initPhotoHandlers)
	} else {
		initPhotoHandlers()
	}

	// Для Electron: если контент загружается динамически, можно добавить MutationObserver
	if (typeof MutationObserver !== 'undefined') {
		const observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.addedNodes.length) {
					const photoBoxes = document.querySelectorAll(
						'.photo-box:not([data-initialized])'
					)
					if (photoBoxes.length) {
						console.log('Обнаружены новые photo-box')
						initPhotoHandlers()
					}
				}
			})
		})

		observer.observe(document.body, {
			childList: true,
			subtree: true
		})
	}
})()
