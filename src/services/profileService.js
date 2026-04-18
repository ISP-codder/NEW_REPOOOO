const ProfileService = {
	init: function (showError, showSuccess) {
		// 1. Подтягиваем ВСЕ данные из памяти при загрузке
		document.getElementById('profileFio').value =
			localStorage.getItem('user_fio') || ''
		document.getElementById('profileLogin').value =
			localStorage.getItem('user_login') || 'admin'
		document.getElementById('profilePosition').value =
			localStorage.getItem('user_position') || ''
		document.getElementById('profileRegDate').value =
			localStorage.getItem('user_reg_date') || '---'
		document.getElementById('profileEmail').value =
			localStorage.getItem('user_email') || ''
		document.getElementById('profilePhone').value =
			localStorage.getItem('user_phone') || ''
		document.getElementById('profileLastLogin').value =
			localStorage.getItem('last_login_time') || 'Первый вход'
		const activities = JSON.parse(
			localStorage.getItem('user_activities_list') || '[]'
		)
		document.getElementById('profileActions').value = activities.length
		document.getElementById('profileStatus').value =
			localStorage.getItem('user_status') || 'active'

		// 2. Логика сохранения
		document.getElementById('saveProfileBtn').onclick = () => {
			try {
				// Сохраняем каждое поле в свой ключ
				localStorage.setItem(
					'user_fio',
					document.getElementById('profileFio').value
				)
				localStorage.setItem(
					'user_position',
					document.getElementById('profilePosition').value
				)
				localStorage.setItem(
					'user_email',
					document.getElementById('profileEmail').value
				)
				localStorage.setItem(
					'user_phone',
					document.getElementById('profilePhone').value
				)
				localStorage.setItem(
					'user_status',
					document.getElementById('profileStatus').value
				)

				showSuccess('Данные успешно сохранены')
				const ActivityService = require('./activityService')
				ActivityService.logAction('Редактирование', 'Личный кабинет')
				// КРИТИЧНО: вызываем обновление буквы сразу после сохранения
				if (typeof window.updateAvatar === 'function') {
					window.updateAvatar()
				}
			} catch (e) {
				showError('Ошибка при сохранении данных')
			}
		}
	}
}

module.exports = ProfileService
