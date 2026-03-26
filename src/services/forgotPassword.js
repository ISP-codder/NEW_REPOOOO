const RecoveryService = {
	init: function (showErrorCallback, showSuccessCallback) {
		const restoreBtn = document.getElementById('restoreBtn')
		if (!restoreBtn) return

		restoreBtn.onclick = () => {
			const login = document.getElementById('loginCheck').value.trim()
			const p1 = document.getElementById('newPass').value.trim()
			const p2 = document.getElementById('confirmPass').value.trim()

			if (login !== 'admin') {
				showErrorCallback('Логин не найден')
				return
			}

			if (!p1 || p1 !== p2) {
				showErrorCallback('Пароли не совпадают')
				return
			}

			// СОХРАНЕНИЕ
			localStorage.setItem('user_password', p1)
			localStorage.removeItem('is_authenticated')

			// ДРУЖЕЛЮБНОЕ СООБЩЕНИЕ
			showSuccessCallback(
				'Приятной работы! Пароль успешно обновлен. Сейчас вы вернетесь к экрану входа.'
			)

			// Задержка перед релоадом, чтобы юзер успел прочитать
			setTimeout(() => {
				location.reload()
			}, 2500)
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
