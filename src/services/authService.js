const fs = require('fs')
const path = require('path')

const AuthService = {
	/**
	 * Проверка, авторизован ли пользователь в текущей сессии
	 */
	check: function () {
		return localStorage.getItem('is_authenticated') === 'true'
	},

	/**
	 * Логика входа в систему
	 */
	login: function (login, password) {
		// 1. Получаем список всех зарегистрированных пользователей
		const users = JSON.parse(localStorage.getItem('users_list') || '[]')

		// Обработка случая с пустой базой (дефолтный админ)
		if (users.length === 0 && login === 'admin' && password === '1234') {
			const adminUser = {
				login: 'admin',
				fio: 'Администратор',
				regDate: new Date().toLocaleDateString('ru-RU'),
				lastLoginTime: 'Системный вход'
			}
			this.setSession(adminUser)
			return true
		}

		// 2. Ищем конкретного пользователя по логину и паролю
		const userIndex = users.findIndex(
			u => u.login === login.trim() && u.password === password.trim()
		)

		if (userIndex !== -1) {
			const user = users[userIndex]

			// 3. Устанавливаем сессию (передаем текущие данные пользователя)
			this.setSession(user)

			// 4. ОБНОВЛЯЕМ время последнего входа в базе данных для этого пользователя
			// Это значение будет показано ПРИ СЛЕДУЮЩЕМ входе
			users[userIndex].lastLoginTime = new Date().toLocaleString('ru-RU')
			localStorage.setItem('users_list', JSON.stringify(users))

			return true
		}

		return false
	},

	/**
	 * Сохранение данных текущей сессии в localStorage
	 */
	setSession: function (user) {
		localStorage.setItem('is_authenticated', 'true')

		// Сохраняем "старое" время входа из объекта пользователя для отображения в профиле
		// Если поля нет (новый юзер), пишем "Первый вход"
		localStorage.setItem('last_login_time', user.lastLoginTime || 'Первый вход')

		// Сохраняем остальные данные для UI
		localStorage.setItem('user_fio', user.fio || 'Пользователь')
		localStorage.setItem('user_login', user.login)
		localStorage.setItem('user_reg_date', user.regDate || '')
	},

	/**
	 * Рендеринг страницы входа и обработка событий
	 */
	async renderLogin(container, onLoginSuccess, showErrorCallback) {
		const loginPath = path.join(__dirname, '..', 'views', 'login.html')

		try {
			const html = fs.readFileSync(loginPath, 'utf8')
			container.innerHTML = html

			const btn = document.getElementById('loginBtn')
			const loginInput = document.getElementById('loginInput')
			const passInput = document.getElementById('passwordInput')

			if (!btn) return

			btn.onclick = () => {
				const userLogin = loginInput.value
				const userPass = passInput.value

				if (this.login(userLogin, userPass)) {
					onLoginSuccess()
				} else {
					showErrorCallback('Неверный логин или пароль')
					loginInput.classList.add('invalid')
					passInput.classList.add('invalid')
				}
			}

			// Переход к регистрации
			const toRegister = document.getElementById('toRegister')
			if (toRegister) {
				toRegister.onclick = e => {
					e.preventDefault()
					window.loadView('register')
				}
			}

			// Переход к восстановлению пароля
			const toRecover = document.getElementById('toRecover')
			if (toRecover) {
				toRecover.onclick = e => {
					e.preventDefault()
					window.loadView('forgot-password')
				}
			}
		} catch (err) {
			console.error('Ошибка загрузки login.html:', err)
			container.innerHTML = `<div style="padding:20px;"><h2>Ошибка системы</h2><p>${err.message}</p></div>`
		}
	},

	/**
	 * Выход из системы
	 */
	logout: function () {
		localStorage.removeItem('is_authenticated')
		localStorage.removeItem('user_fio')
		localStorage.removeItem('user_login')
		localStorage.removeItem('user_reg_date')
		localStorage.removeItem('last_login_time')
		location.reload()
	}
}

module.exports = AuthService
