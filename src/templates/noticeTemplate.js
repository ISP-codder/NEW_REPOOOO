const {
	Paragraph,
	TextRun,
	AlignmentType,
	ImageRun,
	HorizontalPositionAlign,
	TabStopType
} = require('docx')
const fs = require('fs')
const path = require('path')

async function notificationTemplate(data) {
	const children = []
	const formatDate = dateStr => {
		if (!dateStr) return ''
		const [year, month, day] = dateStr.split('-')
		return `${day}.${month}.${year}`
	}

	// 2. Блок получателя
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			spacing: { before: 400 },
			children: [
				new TextRun({
					text: `Кому: ${data.sellerName}`,
					size: 24,
					bold: true,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: `ИНН: ${data.sellerInn}, ОГРН: ${data.sellerOgrn}`,
					break: 1,
					size: 24,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: `Куда: ${data.sellerLegalAddress}`,
					break: 1,
					size: 24,
					bold: true,
					font: 'Times New Roman'
				})
			]
		})
	)

	// 3. Заголовок уведомления
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { before: 400, after: 400 },
			children: [
				new TextRun({
					text: 'Уведомление',
					bold: true,
					size: 28,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: '\nо выявлении факта реализации контрафактного товара',
					bold: true,
					break: 1,
					size: 28,
					font: 'Times New Roman'
				})
			]
		})
	)

	// 4. Основной текст
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: `Уважаемый ${data.sellerName},`,
					size: 24,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: `Уведомляем Вас о том, что в ходе мониторинга рынка/контрольной закупки выявлен факт реализации товара с признаками контрафактности.`,
					break: 1,
					size: 24,
					font: 'Times New Roman'
				})
			],
			spacing: { line: 360 }
		})
	)

	// 5. Сведения о факте
	// 5. Сведения о факте
	children.push(
		new Paragraph({
			spacing: { before: 200 },
			children: [
				new TextRun({
					text: 'Сведения о выявленном факте:',
					bold: true,
					size: 24,
					font: 'Times New Roman'
				})
			]
		})
	)

	const facts = [
		`Торговая точка: ${data.shopName}.`,
		`Адрес торговой точки: ${data.shopLocation}, ${data.shopStreet}.`,
		`Дата выявления/приобретения товара: ${formatDate(data.purchaseDate)}.`,
		`Признаки контрафактности: ${data.trademark}.`,
		`Правообладатель: ${data.rightHolder}.`
	]

	facts.forEach(fact => {
		children.push(
			new Paragraph({
				children: [
					new TextRun({ text: fact, size: 24, font: 'Times New Roman' })
				]
			})
		)
	})

	// 6. Законодательство (Тире у левого края)
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			spacing: { before: 200 },
			children: [
				new TextRun({
					text: 'Реализация указанного товара нарушает исключительные права правообладателя и противоречит законодательству Российской Федерации, в том числе:',
					size: 24,
					font: 'Times New Roman'
				})
			]
		})
	)

	const laws = [
		'ст. 1484 ГК РФ (исключительное право на товарный знак);',
		'ст. 1515 ГК РФ (ответственность за незаконное использование товарного знака);',
		'ст. 1252 ГК РФ (защита исключительных прав);',
		'ст. 1229 ГК РФ (содержание исключительного права);',
		'ст. 14.10 КоАП РФ (незаконное использование средств индивидуализации товаров);',
		'ст. 180 УК РФ (незаконное использование средств индивидуализации товаров, работ, услуг — при наличии признаков состава преступления).'
	]

	laws.forEach(law => {
		children.push(
			new Paragraph({
				alignment: AlignmentType.JUSTIFY,
				indent: { left: 440, hanging: 440 }, // Тире встает вровень с текстом
				spacing: { before: 80 },
				children: [
					new TextRun({ text: `—\t${law}`, size: 24, font: 'Times New Roman' })
				]
			})
		)
	})

	// 7. Требования
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { before: 200 },
			children: [
				new TextRun({
					text: 'Требуем:',
					bold: true,
					size: 28,
					font: 'Times New Roman'
				})
			]
		})
	)

	const requirements = [
		'Немедленно прекратить реализацию товара с признаками контрафактности.',
		'Изъять из оборота и удалить с витрин/склада/интернет-площадок весь товар, нарушающий права.',
		'Предоставить письменные пояснения о поставщике товара и копии подтверждающих документов.',
		'Сообщить о количестве реализованного и находящегося в остатке товара.',
		`Оплатить сумму компенсации в размере ${data.compensationAmount} руб. также возможно посредством перевода по QR-коду.`
	]

	requirements.forEach((req, index) => {
		children.push(
			new Paragraph({
				alignment: AlignmentType.JUSTIFY,
				children: [
					new TextRun({
						text: `${index + 1}. ${req}`,
						size: 24,
						font: 'Times New Roman'
					})
				]
			})
		)
	})
	// 8. QR-код (сразу после требований на НОВОЙ странице)
	try {
		const qrPath = path.join(
			__dirname,
			'..',
			'assets',
			'images',
			'static-qr.png'
		)
		if (fs.existsSync(qrPath)) {
			children.push(
				new Paragraph({
					alignment: AlignmentType.LEFT,
					children: [
						new ImageRun({
							data: fs.readFileSync(qrPath),
							transformation: { width: 120, height: 120 },
							type: 'png'
						})
					],
					spacing: { before: 200, after: 200 }
				})
			)
		}
	} catch (e) {
		console.error('Ошибка вставки QR-кода:', e)
	}

	// 9. Контакты (сразу после QR-кода)
	children.push(
		new Paragraph({
			spacing: { after: 100 },
			children: [
				new TextRun({
					text: 'По вопросам, связанным с настоящим уведомлением, Вы можете связаться с нами по следующим контактным данным:',
					size: 24,
					font: 'Times New Roman'
				})
			]
		}),
		new Paragraph({
			spacing: { before: 100 },
			children: [
				new TextRun({
					text: 'E-mail: uk.ship.999@yandex.ru',
					size: 24,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: 'Телефон: +7 989 517-54-87',
					break: 1,
					size: 24,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: 'WhatsApp: +7 989 517-54-87',
					break: 1,
					size: 24,
					font: 'Times New Roman'
				})
			]
		})
	)

	// 10. Рекомендация по WhatsApp
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			spacing: { before: 200 },
			children: [
				new TextRun({
					text: 'Для связи через WhatsApp рекомендуем предварительно сохранить указанный номер в телефонной книжке вашего устройства.',
					size: 24,
					font: 'Times New Roman'
				})
			]
		})
	)

	// 11. Предупреждение о суде
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			spacing: { before: 200 },
			children: [
				new TextRun({
					text: 'В случае неисполнения указанных требований в установленный срок мы будем вынуждены обратиться в суд, а также в правоохранительные и контролирующие органы для привлечения виновных лиц к ответственности, включая взыскание компенсации, судебных расходов и иных убытков.',
					size: 24,
					font: 'Times New Roman'
				})
			]
		})
	)

	// 12. Подпись
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			spacing: { before: 400 },
			children: [
				new TextRun({
					text: 'С уважением,',
					size: 24,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: 'ООО «ЮК ШИП»',
					break: 1,
					size: 24,
					font: 'Times New Roman'
				})
			]
		})
	)

	return children
}

module.exports = notificationTemplate
