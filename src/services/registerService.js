const RegisterService = {
	init: function (showErrorCallback, showSuccessCallback) {
		const registerBtn = document.getElementById('registerBtn')
		if (!registerBtn) return
		const now = new Date().toLocaleString()
		localStorage.setItem('user_reg_date', now)
		localStorage.setItem('user_actions', '0')
		registerBtn.onclick = () => {
			const login = document.getElementById('regLogin').value.trim()
			const p1 = document.getElementById('regPass').value.trim()
			const p2 = document.getElementById('regPassConfirm').value.trim()

			if (!login || !p1) {
				showErrorCallback('Заполните все поля')
				return
			}

			if (p1 !== p2) {
				showErrorCallback('Пароли не совпадают')
				return
			}

			// Имитация сохранения пользователя (в данной архитектуре перезаписываем админа)
			localStorage.setItem('user_login', login)
			localStorage.setItem('user_password', p1)

			showSuccessCallback('Регистрация успешна! Теперь вы можете войти.')
			const regDate = new Date().toLocaleDateString('ru-RU') + 'г.'
			localStorage.setItem('user_reg_date', regDate)
			localStorage.setItem('user_fio', '') // Инициализируем пустые поля
			localStorage.setItem('user_actions', '0')
			location.reload()
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

module.exports = RegisterService
