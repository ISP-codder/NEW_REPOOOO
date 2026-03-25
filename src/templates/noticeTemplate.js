const {
	Paragraph,
	TextRun,
	AlignmentType,
	ImageRun,
	HorizontalPositionAlign
} = require('docx')
const fs = require('fs')
const path = require('path')
const { processImage } = require('../utils/imageProcessor')

async function notificationTemplate(data, photos) {
	const children = []

	// 1. Блок "Кому" (выравнивание по правому краю)
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: `Кому: ${data.sellerName || '(ФИО ИП/организация)'}`,
					bold: true
				}),
				new TextRun({
					text: `\nИНН: ${data.sellerInn}, ОГРН: ${data.sellerOgrn}`,
					break: 1
				}),
				new TextRun({
					text: `\nКуда: `,
					break: 1
				}),
				new TextRun({
					text: `${data.sellerLegalAddress}`
				})
			],
			spacing: { after: 400 }
		})
	)

	// 2. Заголовок
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			children: [
				new TextRun({ text: 'Уведомление', bold: true, size: 28 }),
				new TextRun({
					text: '\nо выявлении факта реализации контрафактного товара',
					bold: true,
					size: 20,
					break: 1
				})
			],
			spacing: { after: 400 }
		})
	)

	// 3. Обращение и вводная часть
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: `Уважаемый(ая) ${data.sellerName || 'ИП Иванов Иван Иванович'},`
				}),
				new TextRun({
					text: `\nУведомляем Вас о том, что в ходе мониторинга рынка/контрольной закупки выявлен факт реализации товара с признаками контрафактности.`,
					break: 1
				})
			],
			spacing: { line: 360, before: 200 }
		})
	)

	// 4. Сведения о выявленном факте
	children.push(
		new Paragraph({
			children: [
				new TextRun({ text: 'Сведения о выявленном факте:', bold: true })
			],
			spacing: { before: 200 }
		})
	)

	const facts = [
		`Торговая точка: ${data.shopName || '(Название)'}.`,
		`Адрес торговой точки: ${data.shopLocation || ''}, ${data.shopStreet || ''}.`,
		`Дата выявления/приобретения товара: ${data.purchaseDate || '(дата)'}.`,
		`Признаки контрафактности: ${data.trademark || '(товарный знак)'}.`,
		`Правообладатель: ${data.rightHolder || '(Наименование)'}.`
	]

	facts.forEach(fact => {
		children.push(
			new Paragraph({
				text: fact,
				spacing: { before: 100 },
				break: 1
			})
		)
	})

	// 5. Правовое обоснование
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: '\nРеализация указанного товара нарушает исключительные права правообладателя и противоречит законодательству Российской Федерации, в том числе:',
					break: 1
				})
			],
			spacing: { before: 200 }
		})
	)

	const laws = [
		'~ст. 1484 ГК РФ (исключительное право на товарный знак);',
		'~ст. 1515 ГК РФ (ответственность за незаконное использование товарного знака);',
		'~ст. 1252 ГК РФ (защита исключительных прав);',
		'~ст. 1229 ГК РФ (содержание исключительного права);',
		'~ст. 14.10 КоАП РФ (незаконное использование средств индивидуализации);',
		'~ст. 180 УК РФ (незаконное использование средств индивидуализации — при наличии признаков состава преступления).'
	]

	laws.forEach(law => {
		children.push(
			new Paragraph({
				children: [new TextRun({ text: law, size: 18 })],
				spacing: { before: 80 },
				break: 1
			})
		)
	})

	// 6. Требования
	children.push(
		new Paragraph({
			alignment: HorizontalPositionAlign.CENTER,
			children: [new TextRun({ text: '\nТРЕБУЕМ:', bold: true, break: 1 })],
			spacing: { before: 200 }
		})
	)

	const requirements = [
		'Немедленно прекратить реализацию товара с признаками контрафактности.',
		'Изъять из оборота и удалить с витрин/склада/интернет-площадок весь товар, нарушающий права.',
		'Предоставить письменные пояснения о поставщике товара и копии подтверждающих документов.',
		'Сообщить о количестве реализованного и находящегося в остатке товара.',
		`Оплатить сумму компенсации/досудебного урегулирования в размере: ${data.compensationAmount} / ${data.preTrialCompensation} руб.  также возможно посредством перевода по QR-коду, предоставленному правообладателем (его представителем). Оплата по QR-коду признается надлежащим исполнением денежного обязательства при условии поступления средств в полном объеме.`
	]

	requirements.forEach((req, index) => {
		children.push(
			new Paragraph({
				text: `${index + 1}. ${req}`,
				spacing: { before: 100 }
			})
		)
	})

	// Вставка QR-кода
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
							transformation: { width: 100, height: 100 },
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

	// 8. Заключительная часть
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'В случае неисполнения указанных требований в установленный срок мы будем вынуждены обратиться в суд, а также в правоохранительные и контролирующие органы для привлечения виновных лиц к ответственности, включая взыскание компенсации, судебных расходов и иных убытков.'
				})
			],
			spacing: { before: 200 }
		})
	)

	// 9. Подпись
	children.push(
		new Paragraph({
			alignment: AlignmentType.RIGHT,
			children: [
				new TextRun({ text: '\nС уважением,', break: 1 }),
				new TextRun({ text: '\nООО «ЮК ШИП»', bold: true, break: 1 })
			],
			spacing: { before: 400 }
		})
	)

	// 10. Фотографии (если переданы)
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

module.exports = notificationTemplate
