const fs = require('fs')
const path = require('path')

// Константы (в идеале их стоит получать из main процесса через IPC для безопасности)
const ADMIN_LOGIN = 'admin'
const ADMIN_PASS = '1234'

class AuthService {
	constructor() {
		// this.isAuthorized = localStorage.getItem('isAuthorized') === 'true'
		this.isAuthorized = localStorage.getItem('isAuthorized') === 'true'
	}

	// Проверка текущего статуса
	check() {
		return localStorage.getItem('isAuthorized') === 'true'
	}

	// Логика входа
	login(login, password) {
		if (login === ADMIN_LOGIN && password === ADMIN_PASS) {
			localStorage.setItem('isAuthorized', 'true')
			return true
		}
		return false
	}

	// Выход из системы
	logout() {
		localStorage.removeItem('isAuthorized')
		window.location.reload() // Перезагружаем интерфейс
	}

	// Загрузка экрана логина
	async renderLogin(container, onLoginSuccess, showErrorCallback) {
		const loginPath = path.join(__dirname, '..', 'views', 'login.html')
		container.innerHTML = fs.readFileSync(loginPath, 'utf8')

		const btn = document.getElementById('loginBtn')
		const loginInput = document.getElementById('loginInput')
		const passInput = document.getElementById('passwordInput')

		btn.onclick = () => {
			const success = this.login(loginInput.value, passInput.value)
			if (success) {
				onLoginSuccess()
			} else {
				showErrorCallback('Неверный логин или пароль')
				loginInput.classList.add('invalid')
				passInput.classList.add('invalid')
			}
		}
	}

	clearSession() {
		localStorage.removeItem('isAuthorized')
		// Если есть другие данные (например, имя пользователя), чистим и их
		// localStorage.clear(); // Можно использовать это для полной очистки всех ключей
	}

	logout() {
		this.clearSession()
		window.location.reload()
	}
}

module.exports = new AuthService()
