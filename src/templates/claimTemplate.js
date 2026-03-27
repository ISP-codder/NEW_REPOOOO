const { Paragraph, TextRun, AlignmentType, ImageRun } = require('docx')
const fs = require('fs')
const path = require('path')
const { processImage } = require('../utils/imageProcessor')

async function claimTemplate(data, photos) {
	const children = []
	const formatDate = dateStr => {
		if (!dateStr) return ''
		const [year, month, day] = dateStr.split('-')
		return `${day}.${month}.${year}`
	}
	// 1. Блок "Кому" (выравнивание по правому краю) [cite: 25-27]
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT, // Теперь слева, как на первом скрине
			children: [
				new TextRun({
					text: `Кому: ${data.sellerName}`,
					bold: true
				}),
				new TextRun({
					text: `(ИНН: ${data.sellerInn}), (ОГРН: ${data.sellerOgrn})`,
					break: 1
				}),
				new TextRun({
					text: `Куда: ${data.sellerLegalAddress}`,
					break: 1
				})
			],
			spacing: { after: 400 }
		})
	)

	// 2. Заголовок [cite: 28-29]
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			children: [
				new TextRun({ text: 'Досудебная претензия', bold: true, size: 28 }),
				new TextRun({
					text: '\nо нарушении исключительных прав на товарный знак',
					bold: true,
					size: 20,
					break: 1
				})
			],
			spacing: { before: 200, after: 200 }
		})
	)

	// 3. Обращение и основной текст [cite: 30-33]
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: `Уважаемый ${data.sellerName},`
				}),
				new TextRun({
					text: `Настоящей претензией заявляем о факте нарушения исключительных прав правообладателя на товарный знак (${data.trademark})`,
					break: 1
				}),
				new TextRun({
					text: `В ходе закупки (${formatDate(data.purchaseDate)}) по адресу: ${data.shopLocation}, ${data.shopStreet} в торговой точке "${data.shopName}" зафиксирована продажа товара (${data.productCategory}), в количестве ${data.productQuantity} стоимостью ${data.productPrice} рублей маркированного обозначением, используемым без законных оснований.`,
					break: 1
				}),
				new TextRun({
					text: `Доказательства нарушения имеются у правообладателя ${data.plaintiffName}.`,
					break: 1
				})
			],
			spacing: { line: 360, after: 200 }
		})
	)

	// 4. Правовая квалификация
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'Правовая квалификация нарушения: ст. 1484 и ст. 1515 ГК РФ, в системной связи со ст. 1229 и ст. 1252 ГК РФ; также применима ст. 14.10 КоАП РФ.'
				})
			],
			spacing: { after: 100 }
		})
	)

	// 5. Требования [cite: 36-42]
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			children: [
				new TextRun({ text: 'ТРЕБУЕМ:', bold: true, size: 28, break: 1 })
			]
		})
	)

	const requirements = [
		'Прекратить использование обозначения, сходного до степени смешения с товарным знаком правообладателя.',
		'Изъять контрафактный товар из оборота и исключить его повторное поступление в продажу.',
		`Выплатить компенсацию в размере ${data.compensationAmount} руб.`,
		'Сообщить данные поставщика и представить подтверждающие документы происхождения товара.',
		'Направить мотивированный письменный ответ.'
	]

	requirements.forEach((req, index) => {
		children.push(
			new Paragraph({
				text: `${index + 1}. ${req}`,
				spacing: { before: 100 }
			})
		)
	})

	// 6. Информация об оплате и ВСТАВКА QR-КОДА [cite: 43-44]
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'Оплату компенсации можно произвести банковским переводом либо по QR-коду, приложенному к претензии.',
					break: 1
				})
			]
		})
	)

	// Вставка QR-кода сразу после текста об оплате
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
					alignment: AlignmentType.CENTER,
					children: [
						new ImageRun({
							data: fs.readFileSync(qrPath),
							transformation: { width: 80, height: 80 },
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

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'При неисполнении требований правообладатель обратится в суд за взысканием компенсации, судебных расходов и применением мер пресечения нарушения.'
				})
			],
			spacing: { before: 200 }
		})
	)

	// 7. Приложения и подпись
	children.push(
		new Paragraph({
			children: [
				new TextRun({ text: '\nПриложения:', bold: true, break: 1 }),
				new TextRun({
					text: '\n1. Доказательства нарушения (чек, фото),',
					break: 1
				}),
				new TextRun({ text: '\n2. Копия Доверенности.', break: 1 })
			]
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.RIGHT,
			children: [
				new TextRun({ text: '\nС уважением,', break: 1 }),
				new TextRun({ text: '\nООО «ЮК ШИП»', bold: true, break: 1 })
			],
			spacing: { before: 100 }
		})
	)

	// 8. Фотографии (если есть) [cite: 51-52]
	for (const [title, buffer] of Object.entries(photos)) {
		if (buffer && buffer.length > 0) {
			const cleanImg = await processImage(buffer)
			if (cleanImg) {
				children.push(
					new Paragraph({
						text: title,
						bold: true,
						spacing: { before: 400, after: 100 },
						alignment: AlignmentType.CENTER
					})
				)
				children.push(
					new Paragraph({
						alignment: AlignmentType.CENTER,
						children: [
							new ImageRun({
								data: cleanImg,
								transformation: { width: 450, height: 337 },
								type: 'jpg'
							})
						]
					})
				)
			}
		}
	}

	return children
}

module.exports = claimTemplate
