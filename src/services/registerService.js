const RegisterService = {
	init: function (showErrorCallback, showSuccessCallback) {
		const registerBtn = document.getElementById('registerBtn')
		if (!registerBtn) return

		registerBtn.onclick = () => {
			const login = document.getElementById('regLogin').value.trim()
			const p1 = document.getElementById('regPass').value.trim()
			const p2 = document.getElementById('regPassConfirm').value.trim()
			const fio =
				document.getElementById('regFio')?.value.trim() || 'Новый пользователь'

			if (!login || !p1) {
				showErrorCallback('Заполните все поля')
				return
			}

			if (p1 !== p2) {
				showErrorCallback('Пароли не совпадают')
				return
			}

			// 1. Получаем текущий список пользователей из базы (массив)
			const users = JSON.parse(localStorage.getItem('users_list') || '[]')

			// 2. Проверяем, не занят ли логин
			const userExists = users.some(user => user.login === login)
			if (userExists) {
				showErrorCallback('Пользователь с таким логином уже зарегистрирован')
				return
			}

			// 3. Создаем объект нового пользователя
			const newUser = {
				login: login,
				password: p1,
				fio: fio,
				regDate: new Date().toLocaleDateString('ru-RU') + 'г.',
				lastLoginTime: 'Первый вход', // <--- Добавляем персональное поле
				actionsTotal: 0,
				status: 'Активен'
			}

			// 4. Добавляем в массив и сохраняем обратно в localStorage
			users.push(newUser)
			localStorage.setItem('users_list', JSON.stringify(users))

			showSuccessCallback('Регистрация успешна! Теперь вы можете войти.')

			// Небольшая задержка перед релоадом, чтобы юзер увидел успех
			setTimeout(() => {
				location.reload()
			}, 1000)
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
