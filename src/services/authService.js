const fs = require('fs')
const path = require('path')

const AuthService = {
	check: function () {
		return localStorage.getItem('is_authenticated') === 'true'
	},

	login: function (login, password) {
		// 1. Получаем список всех зарегистрированных пользователей
		const users = JSON.parse(localStorage.getItem('users_list') || '[]')

		// По умолчанию оставляем админа, если список пуст (для первой отладки)
		if (users.length === 0 && login === 'admin' && password === '1234') {
			this.setSession({ login: 'admin', fio: 'Администратор' })
			return true
		}

		// 2. Ищем пользователя с совпадающим логином и паролем
		const user = users.find(
			u => u.login === login.trim() && u.password === password.trim()
		)

		if (user) {
			this.setSession(user)
			return true
		}
		return false
	},

	// Вспомогательный метод для сохранения сессии текущего пользователя
	setSession: function (user) {
		const lastSession = localStorage.getItem('current_login_session')
		if (lastSession) {
			localStorage.setItem('last_login_time', lastSession)
		}

		const now = new Date().toLocaleString('ru-RU')
		localStorage.setItem('current_login_session', now)
		localStorage.setItem('is_authenticated', 'true')

		// Сохраняем данные конкретно этого пользователя для отображения в профиле
		localStorage.setItem('user_fio', user.fio || '')
		localStorage.setItem('user_login', user.login)
		localStorage.setItem('user_reg_date', user.regDate || now)
	},

	async renderLogin(container, onLoginSuccess, showErrorCallback) {
		const loginPath = path.join(__dirname, '..', 'views', 'login.html')

		try {
			const html = fs.readFileSync(loginPath, 'utf8')
			container.innerHTML = html

			const btn = document.getElementById('loginBtn')
			const loginInput = document.getElementById('loginInput')
			const passInput = document.getElementById('passwordInput')

			btn.onclick = () => {
				if (this.login(loginInput.value, passInput.value)) {
					onLoginSuccess()
				} else {
					showErrorCallback('Неверный логин или пароль')
					loginInput.classList.add('invalid')
					passInput.classList.add('invalid')
				}
			}

			const toRegister = document.getElementById('toRegister')
			if (toRegister) {
				toRegister.onclick = e => {
					e.preventDefault()
					window.loadView('register')
				}
			}

			// Дополнительный мост для восстановления (если нужно)
			const toRecover = document.getElementById('toRecover')
			if (toRecover) {
				toRecover.onclick = e => {
					e.preventDefault()
					window.loadView('forgot-password')
				}
			}
		} catch (err) {
			console.error('Ошибка загрузки login.html:', err)
			container.innerHTML = `<h2>Ошибка загрузки</h2><p>${err.message}</p>`
		}
	},

	logout: function () {
		localStorage.removeItem('is_authenticated')
		localStorage.removeItem('user_fio')
		localStorage.removeItem('user_login')
		location.reload()
	}
}

module.exports = AuthService
