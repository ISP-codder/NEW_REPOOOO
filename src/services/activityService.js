const ActivityService = {
	currentPage: 1,
	rowsPerPage: 10,

	// Получаем ключ хранилища для текущего пользователя для изоляции данных
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
		// Инициализация таблицы или диаграммы в зависимости от активного вью
		const tableContainer = document.getElementById('activity-table-body')
		if (tableContainer) {
			this.renderTable()
			this.renderPagination()
		}

		const chartContainer = document.getElementById('barChartContainer')
		if (chartContainer) {
			this.renderChart()
		}
	},

	// --- ЛОГИКА ТАБЛИЦЫ ---
	renderTable: function () {
		const container = document.getElementById('activity-table-body')
		if (!container) return

		const activities = JSON.parse(
			localStorage.getItem(this._getStorageKey()) || '[]'
		)
		const start = (this.currentPage - 1) * this.rowsPerPage
		const end = start + this.rowsPerPage
		const paginatedItems = activities.slice(start, end)

		container.innerHTML = paginatedItems
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
	},

	renderPagination: function () {
		const paginationContainer = document.querySelector('.pagination')
		if (!paginationContainer) return

		const activities = JSON.parse(
			localStorage.getItem(this._getStorageKey()) || '[]'
		)
		const totalPages = Math.ceil(activities.length / this.rowsPerPage)

		let html = ''
		for (let i = 1; i <= totalPages; i++) {
			html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="ActivityService.goToPage(${i})">${i}</button>`
		}
		paginationContainer.innerHTML = html
	},

	goToPage: function (page) {
		this.currentPage = page
		this.renderTable()
		this.renderPagination()
	},

	// --- ЛОГИКА ДИАГРАММЫ ---
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
				const itemMonthYear = `${parts[2]}-${parts[1]}` // YYYY-MM
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
		const yAxis = document.getElementById('yAxis')
		const gridLines = document.getElementById('gridLines')

		if (!periodInput || !container) return

		if (!periodInput.value) {
			const now = new Date()
			periodInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
		}

		// Очищаем и рисуем ось Y и сетку
		if (yAxis) yAxis.innerHTML = ''
		if (gridLines) gridLines.innerHTML = ''

		for (let i = 140; i >= 0; i -= 5) {
			if (yAxis) yAxis.innerHTML += `<span>${i}</span>`
			if (gridLines) {
				const line = document.createElement('div')
				line.className = 'grid-line'
				gridLines.appendChild(line)
			}
		}

		const stats = this.getStatsForMonth(periodInput.value)
		const mapping = [
			{ key: 'Претензия', label: 'Претензии', color: '#e30613' },
			{ key: 'Исковое заявление', label: 'Иски', color: '#4310e6' },
			{ key: 'Уведомление', label: 'Уведомления', color: '#39ff14' },
			{ key: 'Мировое соглашение', label: 'Мировые согл.', color: '#ff00ff' },
			{ key: 'Отчет', label: 'Отчеты', color: '#000000' }
		]

		// Генерируем только бары и подписи под ними
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
            </div>
        `
			})
			.join('')
	}
}

window.ActivityService = ActivityService
module.exports = ActivityService
