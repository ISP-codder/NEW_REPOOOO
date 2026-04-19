const ActivityService = require('./activityService')

const ClientService = {
	initForeign: function (showError, showSuccess) {
		const btn = document.getElementById('addForeignClientBtn')
		if (!btn) return

		btn.onclick = () => {
			const form = document.getElementById('foreignClientForm')
			const inputs = form.querySelectorAll('input')
			let isValid = true

			// Сбрасываем предыдущую подсветку
			inputs.forEach(input => input.classList.remove('invalid'))

			// Проверка всех полей
			inputs.forEach(input => {
				if (!input.value.trim()) {
					input.classList.add('invalid')
					isValid = false
				}
			})

			if (!isValid) {
				showError('Пожалуйста, заполните все поля, выделенные красным!')
				return
			}

			// Если всё ок, собираем данные
			const clientData = {
				id: Date.now(),
				type: 'Иностранный',
				origName: document.getElementById('origName').value,
				rusName: document.getElementById('rusName').value,
				regNumber: document.getElementById('regNumber').value,
				country: document.getElementById('country').value,
				address: document.getElementById('address').value,
				bankName: document.getElementById('bankName').value,
				bik: document.getElementById('bik').value,
				iban: document.getElementById('iban').value,
				contactPerson: document.getElementById('contactPerson').value,
				phone: document.getElementById('phone').value,
				email: document.getElementById('email').value,
				createdAt: new Date().toLocaleString('ru-RU')
			}

			// Сохранение
			const allClients = JSON.parse(
				localStorage.getItem('all_clients_list') || '[]'
			)
			allClients.unshift(clientData)
			localStorage.setItem('all_clients_list', JSON.stringify(allClients))

			// Лог в журнал
			ActivityService.logAction(
				'Добавление клиента',
				`Ин. клиент: ${clientData.rusName || clientData.origName}`
			)

			showSuccess('Иностранный клиент успешно добавлен!')
		}
	},
	// Добавь этот метод в объект ClientService
	initRussian: function (showError, showSuccess) {
		const btn = document.getElementById('addRussianClientBtn')
		if (!btn) return

		btn.onclick = () => {
			const form = document.getElementById('russianClientForm')
			const inputs = form.querySelectorAll('input')
			let isValid = true

			inputs.forEach(input => {
				input.classList.remove('invalid')
				if (!input.value.trim()) {
					input.classList.add('invalid')
					isValid = false
				}
			})

			if (!isValid) {
				showError('Заполните все поля!')
				return
			}

			const clientData = {
				id: Date.now(),
				type: 'РФ', // Метка для фильтрации в будущем
				name: document.getElementById('orgName').value,
				inn: document.getElementById('inn').value,
				ogrn: document.getElementById('ogrn').value,
				address: document.getElementById('legalAddress').value,
				email: document.getElementById('email').value,
				phone: document.getElementById('phone').value,
				createdAt: new Date().toLocaleString('ru-RU')
			}

			// Сохранение в общую базу
			const allClients = JSON.parse(
				localStorage.getItem('all_clients_list') || '[]'
			)
			allClients.unshift(clientData)
			localStorage.setItem('all_clients_list', JSON.stringify(allClients))

			// Журнал активности
			ActivityService.logAction(
				'Добавление клиента',
				`Клиент РФ: ${clientData.name}`
			)

			showSuccess('Клиент РФ успешно добавлен!')
		}
	}
}

module.exports = ClientService
