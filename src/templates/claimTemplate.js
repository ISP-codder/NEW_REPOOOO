const {
	Paragraph,
	TextRun,
	AlignmentType,
	ImageRun,
	PageBreak
} = require('docx')
const fs = require('fs')
const path = require('path')
const { processImage } = require('../utils/imageProcessor')

async function claimTemplate(data, photos) {
	const children = []

	const baseTextStyle = { size: 20 }

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
					...baseTextStyle,
					text: `Кому: `,
					bold: true
				}),
				new TextRun({
					...baseTextStyle,
					text: `${data.sellerName}`,
					bold: false
				}),
				new TextRun({
					...baseTextStyle,
					text: `ИНН: ${data.sellerInn}, ОГРН: ${data.sellerOgrn}`,
					break: 1
				}),
				new TextRun({
					...baseTextStyle,
					text: `Куда: `,
					bold: true,
					break: 1
				}),
				new TextRun({
					...baseTextStyle,
					text: `${data.sellerLegalAddress}`,
					bold: false
				})
			],
			spacing: { before: 0, after: 200 }
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			children: [
				new TextRun({ text: 'Досудебная претензия', bold: true, size: 24 }),
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

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					...baseTextStyle,
					text: `Уважаемый ${data.sellerName},`
				}),
				new TextRun({
					...baseTextStyle,
					text: `Настоящей претензией заявляем о факте нарушения исключительных прав правообладателя на товарный знак ${data.trademark}`,
					break: 1
				}),
				new TextRun({
					...baseTextStyle,
					text: `В ходе закупки ${formatDate(data.purchaseDate)} по адресу: ${data.shopLocation}, ${data.shopStreet} в торговой точке "${data.shopName}" зафиксирована продажа товара ${data.productCategory}, в количестве ${data.productQuantity} стоимостью ${data.productPrice} рублей маркированного обозначением, используемым без законных оснований.`,
					break: 1
				}),
				new TextRun({
					...baseTextStyle,
					text: `Доказательства нарушения имеются у правообладателя ${data.plaintiffName}.`,
					break: 1
				})
			],
			spacing: { line: 360, after: 200 }
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					...baseTextStyle,
					text: 'Правовая квалификация нарушения: ст. 1484 и ст. 1515 ГК РФ, в системной связи со ст. 1229 и ст. 1252 ГК РФ; также применима ст. 14.10 КоАП РФ.'
				})
			],
			spacing: { after: 100 }
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			children: [
				new TextRun({ text: 'ТРЕБУЕМ:', bold: true, size: 24, break: 1 })
			]
		})
	)

	const requirements = [
		'Прекратить использование обозначения, сходного до степени смешения с товарным знаком правообладателя.',
		'Изъять контрафактный товар из оборота и исключить его повторное поступление в продажу.',
		'Выплатить компенсацию в размере (УКАЗАТЬ ЦЕНУ ВРУЧНУЮ) руб.',
		'Сообщить данные поставщика и представить подтверждающие документы происхождения товара.',
		'Направить мотивированный письменный ответ.'
	]

	requirements.forEach((req, index) => {
		const phraseToHighlight = '(УКАЗАТЬ ЦЕНУ ВРУЧНУЮ)'

		if (req.includes(phraseToHighlight)) {
			const parts = req.split(phraseToHighlight)

			children.push(
				new Paragraph({
					children: [
						new TextRun({
							...baseTextStyle,
							text: `${index + 1}. ${parts[0]}`
						}),
						new TextRun({
							...baseTextStyle,
							text: phraseToHighlight,
							highlight: 'yellow',
							bold: true
						}),
						new TextRun({ ...baseTextStyle, text: parts[1] })
					],
					spacing: { before: 100 }
				})
			)
		} else {
			children.push(
				new Paragraph({
					children: [
						new TextRun({ ...baseTextStyle, text: `${index + 1}. ${req}` })
					],
					spacing: { before: 100 }
				})
			)
		}
	})

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					...baseTextStyle,
					text: 'Оплату компенсации можно произвести банковским переводом либо по QR-коду, приложенному к претензии.',
					break: 1
				})
			]
		})
	)

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
		console.error(e)
	}

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					...baseTextStyle,
					text: 'При неисполнении требований правообладатель обратится в суд за взысканием компенсации, судебных расходов и применением мер пресечения нарушения.'
				})
			],
			spacing: { before: 200 }
		})
	)

	children.push(
		new Paragraph({
			children: [
				new TextRun({
					...baseTextStyle,
					text: '\nПриложения:',
					bold: true,
					break: 1
				}),
				new TextRun({
					...baseTextStyle,
					text: '\n1. Доказательства нарушения (чек, фото),',
					break: 1
				}),
				new TextRun({
					...baseTextStyle,
					text: '\n2. Копия Доверенности.',
					break: 1
				})
			]
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.RIGHT,
			children: [
				new TextRun({ ...baseTextStyle, text: '\nС уважением,', break: 1 }),
				new TextRun({
					...baseTextStyle,
					text: '\nООО «ЮК ШИП»',
					bold: true,
					break: 1
				})
			],
			spacing: { before: 100 }
		})
	)
	children.push(
		new Paragraph({
			children: [new PageBreak()]
		})
	)
	for (const [title, buffer] of Object.entries(photos)) {
		if (buffer && buffer.length > 0) {
			const cleanImg = await processImage(buffer)
			if (cleanImg) {
				children.push(
					new Paragraph({
						children: [
							new TextRun({ ...baseTextStyle, text: title, bold: true })
						],
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
						],
						spacing: { after: 400 }
					})
				)
			}
		}
	}

	return children
}

module.exports = claimTemplate
