const ProfileService = {
	init: function (showError, showSuccess) {
		// 1. Получаем текущий логин и список всех пользователей
		const currentLogin = localStorage.getItem('user_login')
		let users = JSON.parse(localStorage.getItem('users_list') || '[]')

		// Находим данные именно текущего пользователя
		let userIndex = users.findIndex(u => u.login === currentLogin)
		let userData = userIndex !== -1 ? users[userIndex] : {}

		// 2. Подтягиваем данные в поля
		document.getElementById('profileFio').value = userData.fio || ''
		document.getElementById('profileLogin').value = currentLogin || 'admin'
		document.getElementById('profilePosition').value = userData.position || ''
		document.getElementById('profileRegDate').value = userData.regDate || '---'
		document.getElementById('profileEmail').value = userData.email || ''
		document.getElementById('profilePhone').value = userData.phone || ''
		document.getElementById('profileLastLogin').value =
			localStorage.getItem('last_login_time') || 'Первый вход'
		document.getElementById('profileStatus').value = userData.status || 'active'

		// Счетчик действий (берем из персонального ключа, который мы настроили в ActivityService)
		const storageKey = `activities_${currentLogin || 'guest'}`
		const activities = JSON.parse(localStorage.getItem(storageKey) || '[]')
		document.getElementById('profileActions').value = activities.length

		// 3. Логика сохранения
		document.getElementById('saveProfileBtn').onclick = () => {
			try {
				const updatedFio = document.getElementById('profileFio').value

				// Обновляем объект пользователя в массиве
				if (userIndex !== -1) {
					users[userIndex] = {
						...users[userIndex],
						fio: updatedFio,
						position: document.getElementById('profilePosition').value,
						email: document.getElementById('profileEmail').value,
						phone: document.getElementById('profilePhone').value,
						status: document.getElementById('profileStatus').value
					}

					// Сохраняем обновленный массив в память
					localStorage.setItem('users_list', JSON.stringify(users))

					// Обновляем текущее FIO в быстром доступе (для аватара и логов)
					localStorage.setItem('user_fio', updatedFio)
				}

				showSuccess('Данные успешно сохранены')

				const ActivityService = require('./activityService')
				ActivityService.logAction('Редактирование', 'Личный кабинет')

				if (typeof window.updateAvatar === 'function') {
					window.updateAvatar()
				}
			} catch (e) {
				console.error(e)
				showError('Ошибка при сохранении данных')
			}
		}
	}
}

module.exports = ProfileService
