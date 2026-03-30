const { Paragraph, TextRun, AlignmentType, ImageRun } = require('docx')

async function lawsuitTemplate(data, photos) {
	const children = []
	const formatDate = dateStr => {
		if (!dateStr) return ''
		const [year, month, day] = dateStr.split('-')
		return `${day}.${month}.${year}`
	}
	const SIZE_12 = 20
	const SIZE_16 = 24

	const bodyStyle = {
		alignment: AlignmentType.JUSTIFY,
		spacing: { before: 80, after: 80 },
		indent: { firstLine: 0 }
	}
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			indent: { firstLine: 0 },
			children: [
				new TextRun({
					text: data.courtName,
					bold: true,
					size: SIZE_12,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: 'Адрес суда: ',
					bold: true,
					break: 1,
					size: SIZE_12,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: data.courtAddress,
					bold: false,
					size: SIZE_12,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: `Истец: `,
					bold: true,
					break: 2,
					size: SIZE_12,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: data.plaintiffName,
					size: SIZE_12,
					font: 'Times New Roman'
				}),

				new TextRun({
					text: `Представитель истца: `,
					bold: true,
					break: 1,
					size: SIZE_12,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: data.representativeName,
					size: SIZE_12,
					font: 'Times New Roman'
				}),

				new TextRun({
					text: `Ответчик: `,
					bold: true,
					break: 2,
					size: SIZE_12,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: `${data.sellerName}`,
					size: SIZE_12,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: `ИНН: ${data.sellerInn}, ОГРН: ${data.sellerOgrn}`,
					break: 1,
					size: SIZE_12,
					font: 'Times New Roman'
				}),

				new TextRun({
					text: `Юридический адрес: `,
					bold: true,
					break: 1,
					size: SIZE_12,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: `${data.sellerLegalAddress}`,
					size: SIZE_12,
					font: 'Times New Roman'
				})
			]
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { before: 400, after: 200 },
			children: [
				new TextRun({
					text: 'Исковое заявление',
					bold: true,
					size: SIZE_16,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: 'о пресечении незаконного использования товарного знака и взыскании компенсации',
					break: 1,
					bold: true,
					size: SIZE_12,
					font: 'Times New Roman'
				})
			]
		})
	)

	const texts = [
		`Истец является правообладателем товарный знак ${data.tmNumbers}.`,
		`Из материалов дела следует, что ${formatDate(data.purchaseDate)} в торговой точке Ответчика ${data.shopName}, адрес: ${data.shopLocation}, ${data.shopStreet} реализовывался товар ${data.productCategory}, в количестве ${data.productCount}, стоимостью ${data.productPrice} рублей с признаками контрафактности. Использование спорного обозначения осуществлялось без разрешения Истца, чем нарушено исключительное право правообладателя.`,
		`Нарушение подтверждается документами, прилагаемыми к иску. Ранее Истец направлял досудебную претензию, однако требования добровольно не исполнены.`
	]

	texts.forEach(t => {
		children.push(
			new Paragraph({
				...bodyStyle,
				children: [
					new TextRun({ text: t, size: SIZE_12, font: 'Times New Roman' })
				]
			})
		)
	})

	children.push(
		new Paragraph({
			...bodyStyle,
			children: [
				new TextRun({
					text: 'С учетом ст. 1229, 1252, 1484, 1515 ГК РФ, а также процессуальных норм ст. 131–132 ГПК РФ (или ст. 125–126 АПК РФ),',
					italic: true,
					size: SIZE_12,
					font: 'Times New Roman'
				})
			]
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { before: 300, after: 200 },
			indent: { firstLine: 0 },
			children: [
				new TextRun({
					text: 'ТРЕБУЕМ:',
					bold: true,
					size: SIZE_16,
					font: 'Times New Roman'
				})
			]
		})
	)

	const requests = [
		'1. Признать действия Ответчика нарушающими исключительные права Истца на товарный знак.',
		'2. Обязать Ответчика прекратить незаконное использование обозначения.',
		'3. Изъять из оборота и уничтожить контрафактный товар, а также предъявить доказательство уничтожения товара.',
		'4. Взыскать компенсацию в сумме (ЦЕНУ УКАЗАТЬ ВРУЧНУЮ)',
		'5. Взыскать судебные расходы, включая госпошлину и расходы на представителя.'
	]

	requests.forEach(text => {
		const highlightPhrase = '(ЦЕНУ УКАЗАТЬ ВРУЧНУЮ)'

		if (text.includes(highlightPhrase)) {
			// Разрезаем строку на части до фразы и после
			const parts = text.split(highlightPhrase)

			children.push(
				new Paragraph({
					...bodyStyle,
					children: [
						// Текст до желтой вставки
						new TextRun({
							text: parts[0],
							size: SIZE_12,
							font: 'Times New Roman'
						}),
						// Сама фраза с выделением
						new TextRun({
							text: highlightPhrase,
							size: SIZE_12,
							font: 'Times New Roman',
							highlight: 'yellow',
							bold: true
						}),
						// Текст после (если он есть)
						new TextRun({
							text: parts[1],
							size: SIZE_12,
							font: 'Times New Roman'
						})
					]
				})
			)
		} else {
			// Обычные строки без выделения
			children.push(
				new Paragraph({
					...bodyStyle,
					children: [
						new TextRun({
							text: text,
							size: SIZE_12,
							font: 'Times New Roman'
						})
					]
				})
			)
		}
	})
	children.push(
		new Paragraph({
			...bodyStyle,
			children: [
				new TextRun({
					text: 'Истец предпринимал меры досудебного урегулирования, включая предложение добровольной оплаты (в том числе с использованием QR-кода), что подтверждает добросовестность поведения Истца.',
					size: SIZE_12,
					font: 'Times New Roman'
				})
			]
		})
	)

	children.push(
		new Paragraph({
			spacing: { before: 600 },
			indent: { firstLine: 0 },
			children: [
				new TextRun({
					text: 'С уважением,',
					size: SIZE_12,
					font: 'Times New Roman'
				}),
				new TextRun({
					text: 'ООО «ЮК ШИП»',
					break: 1,
					size: SIZE_12,
					font: 'Times New Roman'
				})
			]
		})
	)

	return children
}

module.exports = lawsuitTemplate
