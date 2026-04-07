const { log } = require('console')
const fs = require('fs')
const path = require('path')

const AuthService = {
	check: function () {
		return localStorage.getItem('is_authenticated') === 'true'
	},

	login: function (login, password) {
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

	async renderLogin(container, onLoginSuccess, showErrorCallback) {
		const loginPath = path.join(__dirname, '..', 'views', 'login.html')

		try {
			const html = fs.readFileSync(loginPath, 'utf8')
			container.innerHTML = html

			const btn = document.getElementById('loginBtn')
			const loginInput = document.getElementById('loginInput')
			const passInput = document.getElementById('passwordInput')
			const toRecover = document.getElementById('toRecover')
			if (toRecover) {
				toRecover.onclick = e => {
					e.preventDefault()
					if (typeof window.loadView === 'function') {
						console.log('Вызываю loadView для forgot-password')
						window.loadView('forgot-password')
					} else {
						console.error('Ошибка: window.loadView не определена!')
					}
				}
			}
			btn.onclick = () => {
				if (this.login(loginInput.value, passInput.value)) {
					onLoginSuccess()
				} else {
					showErrorCallback('Неверный логин или пароль')
					loginInput.classList.add('invalid')
					passInput.classList.add('invalid')
				}
			}
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
