const ActivityService = {
	currentPage: 1,
	rowsPerPage: 10,

	logAction: function (actionType, objectName) {
		const activities = JSON.parse(
			localStorage.getItem('user_activities_list') || '[]'
		)
		const userName = localStorage.getItem('user_fio') || 'Админ'

		const newAction = {
			date: new Date().toLocaleString('ru-RU'),
			action: actionType,
			object: objectName,
			user: userName
		}

		activities.unshift(newAction)
		localStorage.setItem('user_activities_list', JSON.stringify(activities))

		// Обновляем счетчик для профиля
		localStorage.setItem('user_actions_total', activities.length)
	},

	init: function () {
		this.renderTable()
		this.renderPagination()
	},

	renderTable: function () {
		const container = document.getElementById('activity-table-body')
		const activities = JSON.parse(
			localStorage.getItem('user_activities_list') || '[]'
		)

		// Логика пагинации: вырезаем нужный кусок массива
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
		const activities = JSON.parse(
			localStorage.getItem('user_activities_list') || '[]'
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
	}
}

// Сделаем сервис глобальным, чтобы кнопки пагинации его видели
window.ActivityService = ActivityService
module.exports = ActivityService
