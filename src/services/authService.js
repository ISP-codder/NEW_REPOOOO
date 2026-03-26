const { log } = require('console')
const fs = require('fs')
const path = require('path')

const AuthService = {
	// Проверка: залогинен ли юзер (вызывается в renderer.js)
	check: function () {
		return localStorage.getItem('is_authenticated') === 'true'
	},

	// Логика сверки логина/пароля
	login: function (login, password) {
		// ИСПРАВЛЕНИЕ: Проверяем наличие пароля строго через null.
		// Если там уже есть измененный пароль, это условие просто пропустится.
		if (localStorage.getItem('user_password') === null) {
			localStorage.setItem('user_password', '1234')
		}

		const correctPassword = localStorage.getItem('user_password')

		if (login.trim() === 'admin' && password.trim() === correctPassword) {
			localStorage.setItem('is_authenticated', 'true')
			return true
		}
		return false
	},

	// Отрисовка формы логина
	async renderLogin(container, onLoginSuccess, showErrorCallback) {
		// ВНИМАНИЕ: Путь от этого файла до папки views
		const loginPath = path.join(__dirname, '..', 'views', 'login.html')

		try {
			const html = fs.readFileSync(loginPath, 'utf8')
			container.innerHTML = html

			const btn = document.getElementById('loginBtn')
			const loginInput = document.getElementById('loginInput')
			const passInput = document.getElementById('passwordInput')
			const toRecover = document.getElementById('toRecover') // Ссылка "Забыли пароль"
			if (toRecover) {
				toRecover.onclick = e => {
					e.preventDefault()
					// Используем твою функцию из renderer.js
					if (typeof window.loadView === 'function') {
						console.log('Вызываю loadView для forgot-password')
						window.loadView('forgot-password')
					} else {
						console.error('Ошибка: window.loadView не определена!')
					}
				}
			}
			// Кнопка входа
			btn.onclick = () => {
				// Вызываем login, который теперь корректно берет данные из localStorage
				if (this.login(loginInput.value, passInput.value)) {
					onLoginSuccess()
				} else {
					showErrorCallback('Неверный логин или пароль')
					loginInput.classList.add('invalid')
					passInput.classList.add('invalid')
				}
			}

			// Переход на восстановление БЕЗ перезагрузки страницы
		} catch (err) {
			console.error('Ошибка загрузки login.html:', err)
			container.innerHTML = `<h2>Ошибка загрузки формы входа</h2><p>${err.message}</p>`
		}
	},

	logout: function () {
		localStorage.removeItem('is_authenticated')
		location.reload()
	}
}

module.exports = AuthService
