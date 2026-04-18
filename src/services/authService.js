const fs = require('fs')
const path = require('path')

const AuthService = {
	check: function () {
		return localStorage.getItem('is_authenticated') === 'true'
	},

	login: function (login, password) {
		const correctPassword = localStorage.getItem('user_password') || '1234'
		const correctLogin = localStorage.getItem('user_login') || 'admin'

		if (login.trim() === correctLogin && password.trim() === correctPassword) {
			// Логика записи времени:
			const currentSession = localStorage.getItem('current_login_session')
			if (currentSession) {
				// Если в памяти уже есть запись о входе — переносим её в "Прошлый вход"
				localStorage.setItem('last_login_time', currentSession)
			}

			// Записываем текущий вход как "активный"
			localStorage.setItem(
				'current_login_session',
				new Date().toLocaleString('ru-RU')
			)

			localStorage.setItem('is_authenticated', 'true')
			return true
		}
		return false
	},

	async renderLogin(container, onLoginSuccess, showErrorCallback) {
		const loginPath = path.join(__dirname, '..', 'views', 'login.html')

		try {
			const html = fs.readFileSync(loginPath, 'utf8')
			container.innerHTML = html

			// 1. Логика входа
			const btn = document.getElementById('loginBtn')
			const loginInput = document.getElementById('loginInput')
			const passInput = document.getElementById('passwordInput')
			const last = localStorage.getItem('current_login_time')
			if (last) {
				localStorage.setItem('prev_login_time', last) // Записываем предыдущий вход
			}
			localStorage.setItem('current_login_time', new Date().toLocaleString())
			btn.onclick = () => {
				if (this.login(loginInput.value, passInput.value)) {
					onLoginSuccess()
				} else {
					showErrorCallback('Неверный логин или пароль')
					loginInput.classList.add('invalid')
					passInput.classList.add('invalid')
				}
			}

			// 2. Мост для восстановления пароля
			const toRecover = document.getElementById('toRecover')
			if (toRecover) {
				toRecover.onclick = e => {
					e.preventDefault()
					window.loadView('forgot-password') // Просто переключаем экран
				}
			}

			// 3. Мост для регистрации (БЕЗ логина регистрации внутри)
			const toRegister = document.getElementById('toRegister')
			if (toRegister) {
				toRegister.onclick = e => {
					e.preventDefault()
					window.loadView('register') // Просто переключаем экран
				}
			}
		} catch (err) {
			console.error('Ошибка загрузки login.html:', err)
			container.innerHTML = `<h2>Ошибка загрузки</h2><p>${err.message}</p>`
		}
	},

	logout: function () {
		localStorage.removeItem('is_authenticated')
		location.reload()
	}
}

module.exports = AuthService
