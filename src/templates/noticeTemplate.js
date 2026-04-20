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
const { processImage } = require('../utils/imageProcessor')

async function notificationTemplate(data, photos) {
	const children = []
	const formatDate = dateStr => {
		if (!dateStr) return ''
		const [year, month, day] = dateStr.split('-')
		return `${day}.${month}.${year}`
	}
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: 'Кому: ',
					bold: true,
					size: 20,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: `${data.sellerName}`,
					bold: false,
					size: 20,
					font: 'Times New Roman'
				}),

				new TextRun({
					text: `ИНН: ${data.sellerInn}, ОГРН: ${data.sellerOgrn}`,
					break: 1,
					size: 20
				}),
				new TextRun({
					text: `Куда: `,
					bold: true,
					break: 1,
					size: 20
				}),
				new TextRun({
					text: `${data.sellerLegalAddress}`,
					size: 20
				})
			],
			spacing: { after: 400 }
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			children: [
				new TextRun({ text: 'Уведомление', bold: true, size: 24 }),
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

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: `Уважаемый ${data.sellerName},`,
					size: 20
				}),
				new TextRun({
					text: `Уведомляем Вас о том, что в ходе мониторинга рынка/контрольной закупки выявлен факт реализации товара с признаками контрафактности.`,
					break: 1,
					size: 20
				})
			],
			spacing: { line: 360, before: 200 }
		})
	)

	children.push(
		new Paragraph({
			children: [
				new TextRun({
					text: 'Сведения о выявленном факте:',
					bold: true,
					size: 20
				})
			],
			spacing: { before: 200 }
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
				spacing: { before: 100 },
				children: [
					new TextRun({
						text: fact,
						size: 20,
						font: 'Times New Roman'
					})
				]
			})
		)
	})

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'Реализация указанного товара нарушает исключительные права правообладателя и противоречит законодательству Российской Федерации, в том числе:',
					break: 1,
					size: 20
				})
			],
			spacing: { before: 200 }
		})
	)

	const laws = [
		'ст. 1484 ГК РФ (исключительное право на товарный знак);',
		'ст. 1515 ГК РФ (ответственность за незаконное использование товарного знака);',
		'ст. 1252 ГК РФ (защита исключительных прав);',
		'ст. 1229 ГК РФ (содержание исключительного права);',
		'ст. 14.10 КоАП РФ (незаконное использование средств индивидуализации);',
		'ст. 180 УК РФ (незаконное использование средств индивидуализации — при наличии признаков состава преступления).'
	]

	laws.forEach(law => {
		children.push(
			new Paragraph({
				alignment: AlignmentType.JUSTIFY,
				indent: { left: 360, hanging: 360 },
				tabStops: [{ type: TabStopType.LEFT, position: 360 }],
				spacing: { before: 80 },
				children: [
					new TextRun({
						text: `—\t${law}`,
						size: 20,
						font: 'Times New Roman'
					})
				]
			})
		)
	})

	children.push(
		new Paragraph({
			alignment: HorizontalPositionAlign.CENTER,
			children: [
				new TextRun({ text: '\nТРЕБУЕМ:', bold: true, break: 1, size: 24 })
			],
			spacing: { before: 200 }
		})
	)

	const requirements = [
		'Немедленно прекратить реализацию товара с признаками контрафактности.',
		'Изъять из оборота и удалить с витрин/склада/интернет-площадок весь товар, нарушающий права.',
		'Предоставить письменные пояснения о поставщике товара и копии подтверждающих документов.',
		'Сообщить о количестве реализованного и находящегося в остатке товара.',
		`Сумму компенсации (${data.compensationAmount} к.) возможно оплатить посредством перевода по QR-коду, предоставленному правообладателем (его представителем). Оплата по QR-коду признается надлежащим исполнением денежного обязательства при условии поступления средств в полном объеме.`
	]

	requirements.forEach((req, index) => {
		children.push(
			new Paragraph({
				alignment: AlignmentType.JUSTIFY,
				spacing: { before: 120, after: 120 },
				children: [
					new TextRun({
						text: `${index + 1}. ${req}`,
						size: 20,
						font: 'Times New Roman'
					})
				]
			})
		)
	})

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

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'В случае неисполнения указанных требований в установленный срок мы будем вынуждены обратиться в суд, а также в правоохранительные и контролирующие органы для привлечения виновных лиц к ответственности, включая взыскание компенсации, судебных расходов и иных убытков.',
					size: 20
				})
			],
			spacing: { before: 200 }
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({ text: 'С уважением,', break: 1, size: 20 }),
				new TextRun({ text: 'ООО «ЮК ШИП»', break: 1, size: 20 })
			],
			spacing: { before: 100 }
		})
	)

	return children
}

module.exports = notificationTemplate
