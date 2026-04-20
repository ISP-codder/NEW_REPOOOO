const ActivityService = {
	currentPage: 1,
	rowsPerPage: 10,
	searchQuery: '',
	searchTimeout: null, // Переменная для хранения таймера

	_getStorageKey: function () {
		const currentLogin = localStorage.getItem('user_login') || 'guest'
		return `activities_${currentLogin}`
	},

	logAction: function (actionType, objectName) {
		const storageKey = this._getStorageKey()
		const activities = JSON.parse(localStorage.getItem(storageKey) || '[]')
		const userName = localStorage.getItem('user_fio') || 'Админ'

		const newAction = {
			date: new Date().toLocaleString('ru-RU'),
			action: actionType,
			object: objectName,
			user: userName
		}

		activities.unshift(newAction)
		localStorage.setItem(storageKey, JSON.stringify(activities))
		localStorage.setItem(
			`user_actions_total_${localStorage.getItem('user_login')}`,
			activities.length
		)
	},

	init: function () {
		const searchInput = document.getElementById('activitySearch')
		if (searchInput) {
			searchInput.oninput = e => {
				// Очищаем старый таймер при каждом нажатии клавиши
				clearTimeout(this.searchTimeout)

				// Ставим новый таймер на 1 секунду
				this.searchTimeout = setTimeout(() => {
					this.searchQuery = e.target.value.toLowerCase().trim()
					this.currentPage = 1
					this.updateAndRender()
					console.log('Поиск выполнен:', this.searchQuery)
				}, 1000)
			}
		}

		window.onresize = () => this.updateAndRender()

		const tableContainer = document.getElementById('activity-table-body')
		if (tableContainer) {
			this.updateAndRender()
		}

		const chartContainer = document.getElementById('barChartContainer')
		if (chartContainer) {
			this.renderChart()
		}
	},

	updateAndRender: function () {
		this.calculateRowsPerPage()
		this.renderTable()
		this.renderPagination()
	},

	calculateRowsPerPage: function () {
		const wrapper = document.querySelector('.table-wrapper')
		if (!wrapper) return

		const headerHeight = 50
		const rowHeight = 50
		const availableHeight = wrapper.clientHeight - headerHeight

		this.rowsPerPage = Math.max(1, Math.floor(availableHeight / rowHeight))
	},

	renderTable: function () {
		const container = document.getElementById('activity-table-body')
		if (!container) return

		let activities = JSON.parse(
			localStorage.getItem(this._getStorageKey()) || '[]'
		)

		if (this.searchQuery) {
			activities = activities.filter(
				item =>
					item.date.toLowerCase().includes(this.searchQuery) ||
					item.action.toLowerCase().includes(this.searchQuery) ||
					item.object.toLowerCase().includes(this.searchQuery) ||
					item.user.toLowerCase().includes(this.searchQuery)
			)
		}

		const start = (this.currentPage - 1) * this.rowsPerPage
		const end = start + this.rowsPerPage
		const paginatedItems = activities.slice(start, end)

		let html = paginatedItems
			.map(
				item => `
            <tr>
                <td>${item.date}</td>
                <td>${item.action}</td>
                <td>${item.object}</td>
                <td>${item.user}</td>
            </tr>
        `
			)
			.join('')

		const emptyRowsCount = this.rowsPerPage - paginatedItems.length
		for (let i = 0; i < emptyRowsCount; i++) {
			html += `
                <tr class="empty-row">
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>`
		}

		container.innerHTML = html
	},

	renderPagination: function () {
		const paginationContainer = document.querySelector('.pagination')
		if (!paginationContainer) return

		let activities = JSON.parse(
			localStorage.getItem(this._getStorageKey()) || '[]'
		)
		if (this.searchQuery) {
			activities = activities.filter(item =>
				Object.values(item).some(v =>
					v.toLowerCase().includes(this.searchQuery)
				)
			)
		}

		const totalPages = Math.ceil(activities.length / this.rowsPerPage) || 1
		if (this.currentPage > totalPages) this.currentPage = totalPages

		let html = ''
		for (let i = 1; i <= totalPages; i++) {
			html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                     onclick="window.ActivityService.goToPage(${i})">${i}</button>`
		}
		paginationContainer.innerHTML = html
	},

	goToPage: function (page) {
		this.currentPage = page
		this.renderTable()
		this.renderPagination()
	},

	getStatsForMonth: function (monthYear) {
		const activities = JSON.parse(
			localStorage.getItem(this._getStorageKey()) || '[]'
		)
		const stats = {
			Претензия: 0,
			'Исковое заявление': 0,
			Уведомление: 0,
			'Мировое соглашение': 0,
			Отчет: 0
		}
		activities.forEach(item => {
			const parts = item.date.split(',')[0].split('.')
			if (parts.length === 3) {
				const itemMonthYear = `${parts[2]}-${parts[1]}`
				if (itemMonthYear === monthYear && stats.hasOwnProperty(item.object)) {
					stats[item.object]++
				}
			}
		})
		return stats
	},

	renderChart: function () {
		const periodInput = document.getElementById('chartPeriod')
		const container = document.getElementById('barChartContainer')
		if (!periodInput || !container) return
		const stats = this.getStatsForMonth(periodInput.value || '2026-04')
		const mapping = [
			{ key: 'Претензия', label: 'Претензии', color: '#e30613' },
			{ key: 'Исковое заявление', label: 'Иски', color: '#4310e6' },
			{ key: 'Уведомление', label: 'Уведомления', color: '#39ff14' },
			{ key: 'Мировое соглашение', label: 'Мировые согл.', color: '#ff00ff' },
			{ key: 'Отчет', label: 'Отчеты', color: '#000000' }
		]
		container.innerHTML = mapping
			.map(item => {
				const count = stats[item.key] || 0
				const heightPercent = (count / 140) * 100
				return `
                <div class="bar-slot">
                    <div class="bar-fill" style="height: ${heightPercent}%; background-color: ${item.color}">
                        ${count > 0 ? `<span class="bar-value-top">${count}</span>` : ''}
                    </div>
                    <div class="x-label-fixed">${item.label}</div>
                </div>`
			})
			.join('')
	}
}

window.ActivityService = ActivityService
module.exports = ActivityService
