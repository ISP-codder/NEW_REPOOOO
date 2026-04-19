const RecoveryService = {
	init: function (showErrorCallback, showSuccessCallback) {
		const restoreBtn = document.getElementById('restoreBtn')
		if (!restoreBtn) return

		restoreBtn.onclick = () => {
			const loginInput = document.getElementById('loginCheck').value.trim()
			const p1 = document.getElementById('newPass').value.trim()
			const p2 = document.getElementById('confirmPass').value.trim()

			// 1. Загружаем список всех пользователей
			let users = JSON.parse(localStorage.getItem('users_list') || '[]')

			// 2. Ищем индекс пользователя с таким логином
			const userIndex = users.findIndex(u => u.login === loginInput)

			// Проверка на админа (если список пуст)
			if (userIndex === -1 && loginInput !== 'admin') {
				showErrorCallback('Пользователь с таким логином не найден')
				return
			}

			if (!p1 || p1 !== p2) {
				showErrorCallback('Пароли пусты или не совпадают')
				return
			}

			// 3. Обновляем пароль
			if (userIndex !== -1) {
				// Обновляем пароль в массиве
				users[userIndex].password = p1
				localStorage.setItem('users_list', JSON.stringify(users))
			} else {
				// Если это был дефолтный админ, которого еще нет в списке, создаем его или обновляем старый ключ
				localStorage.setItem('user_password', p1)
			}

			// На всякий случай сбрасываем авторизацию
			localStorage.removeItem('is_authenticated')

			showSuccessCallback(
				'Пароль успешно обновлен! Сейчас вы вернетесь к экрану входа.'
			)

			setTimeout(() => {
				location.reload()
			}, 2000)
		}

		const backBtn = document.getElementById('backToLogin')
		if (backBtn) {
			backBtn.onclick = e => {
				e.preventDefault()
				location.reload()
			}
		}
	}
}

module.exports = RecoveryService
