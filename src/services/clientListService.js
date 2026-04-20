const ActivityService = require('./activityService')

const ClientListService = {
	currentPage: 1,
	rowsPerPage: 10,
	allClients: [],
	filteredClients: [],
	searchTimeout: null,

	init: function () {
		this.allClients = JSON.parse(
			localStorage.getItem('all_clients_list') || '[]'
		)
		this.filteredClients = [...this.allClients]

		// Привязываем сервис к window, чтобы onclick в строках таблицы работал
		window.ClientListService = this

		this.setupEventListeners()
		this.updateAndRender()

		window.onresize = () => this.updateAndRender()
	},

	updateAndRender: function () {
		this.calculateRowsPerPage()
		this.renderTable()
	},

	calculateRowsPerPage: function () {
		const wrapper = document.querySelector('.table-wrapper')
		if (!wrapper) return
		const headerHeight = 50
		const rowHeight = 50
		const availableHeight = wrapper.clientHeight - headerHeight
		this.rowsPerPage = Math.max(1, Math.floor(availableHeight / rowHeight))
	},

	setupEventListeners: function () {
		const modal = document.getElementById('clientModal')
		const confirmModal = document.getElementById('confirmDeleteModal')
		const searchInput = document.getElementById('clientSearch')
		const closeBtn = document.getElementById('closeModal')
		const cancelDeleteBtn = document.getElementById('cancelDeleteBtn')

		if (searchInput) {
			searchInput.oninput = e => {
				clearTimeout(this.searchTimeout)
				this.searchTimeout = setTimeout(() => {
					const term = e.target.value.toLowerCase().trim()
					this.filteredClients = this.allClients.filter(client => {
						return Object.values(client).some(val =>
							String(val).toLowerCase().includes(term)
						)
					})
					this.currentPage = 1
					this.updateAndRender()
				}, 1000)
			}
		}

		if (closeBtn)
			closeBtn.onclick = () => {
				modal.style.display = 'none'
			}
		if (cancelDeleteBtn)
			cancelDeleteBtn.onclick = () => {
				confirmModal.style.display = 'none'
			}

		window.onclick = event => {
			if (event.target === modal) modal.style.display = 'none'
			if (event.target === confirmModal) confirmModal.style.display = 'none'
		}
	},

	renderTable: function () {
		const tbody = document.getElementById('clientsTableBody')
		if (!tbody) return

		const start = (this.currentPage - 1) * this.rowsPerPage
		const end = start + this.rowsPerPage
		const paginatedItems = this.filteredClients.slice(start, end)

		let html = paginatedItems
			.map(client => {
				const organization =
					client.type === 'РФ'
						? client.name || '-'
						: client.rusName || client.origName || '-'
				const person =
					client.type === 'РФ'
						? client.directorName || '-'
						: client.contactPerson || '-'

				// Используем строку вызова глобального объекта
				return `
                <tr onclick="window.ClientListService.openModalById('${client.id}')">
                    <td class="type-column"><b style="color:#731a20">${client.type}</b></td>
                    <td>${organization}</td>
                    <td>${person}</td>
                    <td><small>${client.createdAt || '-'}</small></td>
                </tr>
            `
			})
			.join('')

		const emptyRowsCount = this.rowsPerPage - paginatedItems.length
		for (let i = 0; i < emptyRowsCount; i++) {
			html += `<tr class="empty-row"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`
		}

		tbody.innerHTML = html
		this.renderPagination()
	},

	renderPagination: function () {
		const pageCount =
			Math.ceil(this.filteredClients.length / this.rowsPerPage) || 1
		const container = document.getElementById('pagination')
		if (!container) return

		let html = ''
		for (let i = 1; i <= pageCount; i++) {
			html += `<button class="page-btn ${this.currentPage === i ? 'active' : ''}" 
                     onclick="window.ClientListService.goToPage(${i})">${i}</button>`
		}
		container.innerHTML = html
	},

	goToPage: function (page) {
		this.currentPage = page
		this.renderTable()
	},

	openModalById: function (id) {
		// Находим клиента по ID в общем списке
		const client = this.allClients.find(c => String(c.id) === String(id))
		if (client) {
			this.openModal(client)
		}
	},

	openModal: function (client) {
		const modal = document.getElementById('clientModal')
		const body = document.getElementById('modalBody')
		if (!modal || !body) return

		body.innerHTML = ''
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

		Object.keys(client).forEach(key => {
			if (['id', 'type', 'createdAt', 'date', 'timestamp'].includes(key)) return
			const div = document.createElement('div')
			div.className = 'modal-field'
			div.style.marginBottom = '12px'
			div.innerHTML = `
                <label style="color: #731a20; font-weight: bold; font-size: 13px; display: block; margin-bottom: 4px;">${labelsMap[key] || key}</label>
                <input type="text" data-key="${key}" value="${client[key] || ''}" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ccc; box-sizing: border-box;">
            `
			body.appendChild(div)
		})

		document.getElementById('saveClientChanges').onclick = () =>
			this.saveChanges(client.id)
		document.getElementById('deleteClientBtn').onclick = () => {
			const clientName = client.name || client.rusName || 'этого клиента'
			this.showDeleteConfirmation(client.id, clientName)
		}
		modal.style.display = 'block'
	},

	showDeleteConfirmation: function (clientId, clientName) {
		const confirmModal = document.getElementById('confirmDeleteModal')
		const confirmBtn = document.getElementById('confirmDeleteBtn')
		document.getElementById('confirmDeleteText').innerText =
			`Вы действительно хотите удалить клиента "${clientName}"?`
		confirmModal.style.display = 'block'
		confirmBtn.onclick = () => {
			this.performDelete(clientId, clientName)
			confirmModal.style.display = 'none'
		}
	},

	performDelete: function (clientId, clientName) {
		this.allClients = this.allClients.filter(c => c.id !== clientId)
		localStorage.setItem('all_clients_list', JSON.stringify(this.allClients))
		ActivityService.logAction('Удаление', `Удален клиент: ${clientName}`)
		this.filteredClients = [...this.allClients]
		this.updateAndRender()
		document.getElementById('clientModal').style.display = 'none'
	},

	saveChanges: function (clientId) {
		const inputs = document.querySelectorAll('#modalBody input')
		const index = this.allClients.findIndex(c => c.id === clientId)
		if (index !== -1) {
			const oldName =
				this.allClients[index].name ||
				this.allClients[index].rusName ||
				'Без названия'
			inputs.forEach(input => {
				const key = input.getAttribute('data-key')
				this.allClients[index][key] = input.value
			})
			localStorage.setItem('all_clients_list', JSON.stringify(this.allClients))
			ActivityService.logAction(
				'Редактирование',
				`Изменены данные клиента: ${oldName}`
			)
			this.filteredClients = [...this.allClients]
			this.updateAndRender()
			document.getElementById('clientModal').style.display = 'none'
		}
	}
}

module.exports = ClientListService
window.ClientListService = ClientListService
