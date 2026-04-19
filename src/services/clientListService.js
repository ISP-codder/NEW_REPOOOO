const ActivityService = require('./activityService')

const ClientListService = {
	currentPage: 1,
	rowsPerPage: 10,
	allClients: [],
	filteredClients: [],

	/**
	 * Инициализация сервиса
	 */
	init: function () {
		// Загружаем данные из localStorage
		this.allClients = JSON.parse(
			localStorage.getItem('all_clients_list') || '[]'
		)
		this.filteredClients = [...this.allClients]

		this.renderTable()
		this.setupEventListeners()
	},

	/**
	 * Настройка обработчиков событий
	 */
	setupEventListeners: function () {
		const modal = document.getElementById('clientModal')
		const confirmModal = document.getElementById('confirmDeleteModal')
		const searchInput = document.getElementById('clientSearch')
		const closeBtn = document.getElementById('closeModal')
		const cancelDeleteBtn = document.getElementById('cancelDeleteBtn')

		// Живой поиск по всем полям
		if (searchInput) {
			searchInput.oninput = e => {
				const term = e.target.value.toLowerCase()
				this.filteredClients = this.allClients.filter(client => {
					return Object.values(client).some(val =>
						String(val).toLowerCase().includes(term)
					)
				})
				this.currentPage = 1
				this.renderTable()
			}
		}

		// Закрытие основного модального окна
		if (closeBtn) {
			closeBtn.onclick = () => {
				modal.style.display = 'none'
			}
		}

		// Отмена удаления (закрытие окна подтверждения)
		if (cancelDeleteBtn) {
			cancelDeleteBtn.onclick = () => {
				confirmModal.style.display = 'none'
			}
		}

		// Закрытие окон при клике на затемненный фон (overlay)
		window.onclick = event => {
			if (event.target === modal) modal.style.display = 'none'
			if (event.target === confirmModal) confirmModal.style.display = 'none'
		}
	},

	/**
	 * Отрисовка таблицы с учетом пагинации
	 */
	renderTable: function () {
		const tbody = document.getElementById('clientsTableBody')
		if (!tbody) return

		tbody.innerHTML = ''

		const start = (this.currentPage - 1) * this.rowsPerPage
		const end = start + this.rowsPerPage
		const paginatedItems = this.filteredClients.slice(start, end)

		if (paginatedItems.length === 0) {
			tbody.innerHTML =
				'<tr><td colspan="4" style="text-align:center; padding: 40px; color: #666;">Клиенты не найдены</td></tr>'
			return
		}

		paginatedItems.forEach(client => {
			const tr = document.createElement('tr')

			// Распределяем данные: РФ использует 'name', Иностранные 'rusName' или 'origName'
			const organization =
				client.type === 'РФ'
					? client.name || '-'
					: client.rusName || client.origName || '-'
			const person =
				client.type === 'РФ'
					? client.directorName || '-'
					: client.contactPerson || '-'

			tr.innerHTML = `
                <td><b style="color:#731a20">${client.type}</b></td>
                <td>${organization}</td>
                <td>${person}</td>
                <td><small>${client.createdAt || '-'}</small></td>
            `

			tr.onclick = () => this.openModal(client)
			tbody.appendChild(tr)
		})

		this.renderPagination()
	},

	/**
	 * Отрисовка кнопок пагинации
	 */
	renderPagination: function () {
		const pageCount = Math.ceil(this.filteredClients.length / this.rowsPerPage)
		const container = document.getElementById('pagination')
		if (!container) return

		container.innerHTML = ''
		if (pageCount <= 1) return

		for (let i = 1; i <= pageCount; i++) {
			const btn = document.createElement('button')
			btn.innerText = i
			btn.className = `page-btn ${this.currentPage === i ? 'active' : ''}`
			btn.onclick = () => {
				this.currentPage = i
				this.renderTable()
			}
			container.appendChild(btn)
		}
	},

	/**
	 * Открытие модального окна редактирования
	 */
	openModal: function (client) {
		const modal = document.getElementById('clientModal')
		const body = document.getElementById('modalBody')
		if (!modal || !body) return

		body.innerHTML = ''

		// Словарь для красивых заголовков полей
		const labelsMap = {
			name: 'Наименование (РФ)',
			rusName: 'Наименование (Рус)',
			origName: 'Наименование (Ориг)',
			inn: 'ИНН',
			ogrn: 'ОГРН',
			kpp: 'КПП',
			legalAddress: 'Юр. адрес',
			actualAddress: 'Факт. адрес',
			address: 'Адрес за рубежом',
			bankName: 'Банк',
			bik: 'БИК',
			corrAccount: 'Корр. счет',
			payAccount: 'Расчетный счет',
			iban: 'IBAN',
			directorName: 'Руководитель',
			directorPost: 'Должность',
			contactPerson: 'Контактное лицо',
			phone: 'Телефон',
			email: 'Email',
			country: 'Страна',
			regNumber: 'Рег. номер'
		}

		// Создаем поля ввода на основе имеющихся данных в объекте
		Object.keys(client).forEach(key => {
			if (['id', 'type', 'createdAt', 'date', 'timestamp'].includes(key)) return

			const div = document.createElement('div')
			div.className = 'modal-field'
			div.innerHTML = `
                <label style="color: #731a20; font-weight: bold; font-size: 13px;">${labelsMap[key] || key}</label>
                <input type="text" data-key="${key}" value="${client[key] || ''}" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ccc;">
            `
			body.appendChild(div)
		})

		// Настройка кнопок действий
		document.getElementById('saveClientChanges').onclick = () =>
			this.saveChanges(client.id)

		document.getElementById('deleteClientBtn').onclick = () => {
			const clientName = client.name || client.rusName || 'этого клиента'
			this.showDeleteConfirmation(client.id, clientName)
		}

		modal.style.display = 'block'
	},

	/**
	 * Показ кастомного окна подтверждения удаления
	 */
	showDeleteConfirmation: function (clientId, clientName) {
		const confirmModal = document.getElementById('confirmDeleteModal')
		const confirmBtn = document.getElementById('confirmDeleteBtn')
		const textElement = document.getElementById('confirmDeleteText')

		if (!confirmModal || !confirmBtn) return

		textElement.innerText = `Вы действительно хотите удалить клиента "${clientName}"?`
		confirmModal.style.display = 'block'

		// Перезаписываем событие клика для кнопки "Удалить" в подтверждении
		confirmBtn.onclick = () => {
			this.performDelete(clientId, clientName)
			confirmModal.style.display = 'none'
		}
	},

	/**
	 * Логика физического удаления из базы
	 */
	performDelete: function (clientId, clientName) {
		// Удаляем из общего массива
		this.allClients = this.allClients.filter(c => c.id !== clientId)

		// Синхронизируем с localStorage
		localStorage.setItem('all_clients_list', JSON.stringify(this.allClients))

		// Логируем в журнал активности
		ActivityService.logAction('Удаление', `Удален клиент: ${clientName}`)

		// Обновляем таблицу
		this.filteredClients = [...this.allClients]
		this.renderTable()

		// Закрываем основную карточку
		document.getElementById('clientModal').style.display = 'none'

		if (window.showSuccess) window.showSuccess('Клиент успешно удален')
	},

	/**
	 * Сохранение отредактированных данных
	 */
	saveChanges: function (clientId) {
		const inputs = document.querySelectorAll('#modalBody input')
		const index = this.allClients.findIndex(c => c.id === clientId)

		if (index !== -1) {
			const clientName =
				this.allClients[index].name ||
				this.allClients[index].rusName ||
				'Без названия'

			// Обновляем поля в объекте
			inputs.forEach(input => {
				const key = input.getAttribute('data-key')
				this.allClients[index][key] = input.value
			})

			localStorage.setItem('all_clients_list', JSON.stringify(this.allClients))

			// Логируем редактирование
			ActivityService.logAction(
				'Редактирование',
				`Изменены данные клиента: ${clientName}`
			)

			this.filteredClients = [...this.allClients]
			this.renderTable()
			document.getElementById('clientModal').style.display = 'none'

			if (window.showSuccess) window.showSuccess('Изменения сохранены')
		}
	}
}

module.exports = ClientListService
