const {
	Paragraph,
	TextRun,
	AlignmentType,
	TabStopType,
	TabStopPosition
} = require('docx')

/**
 * Шаблон Мирового соглашения
 * Воспроизводит структуру документа text_mirovoe_soglashenie.docx
 */
async function settlementTemplate(data) {
	const children = []

	// Настройки шрифтов: 12pt (24) и 14pt (28)
	const fontSizeRegular = 20
	const fontSizeHeader = 24

	const formatDate = dateStr => {
		if (!dateStr) return ''
		const [year, month, day] = dateStr.split('-')
		return `${day}.${month}.${year}`
	}

	// 1. Дата и Суд (Верхняя часть)
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: 'Дата мирового соглашения: ',
					bold: true,
					size: fontSizeRegular
				}),
				new TextRun({
					text: `${formatDate(data.date)}г.`,
					bold: false,
					size: fontSizeRegular
				})
			],
			spacing: { before: 100, after: 50 }
		})
	)

	// 2. Суд и Адрес
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: `${data.courtName}`,
					bold: true,
					size: fontSizeRegular
				})
			],
			spacing: { after: 20 }
		}),
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: 'Адрес суда: ',
					bold: true,
					size: fontSizeRegular
				}),
				new TextRun({
					text: `${data.courtAddress}`,
					bold: false,
					size: fontSizeRegular
				})
			],
			spacing: { after: 100 }
		})
	)

	// 2. Стороны (Истец и Ответчик)
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({ text: 'Истец: ', bold: true, size: fontSizeRegular }),
				new TextRun({
					text: `${data.plaintiffName}`,
					bold: false,
					size: fontSizeRegular
				})
			],
			spacing: { after: 20 }
		}),
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({ text: 'Ответчик: ', bold: true, size: fontSizeRegular }),
				new TextRun({
					text: `${data.defendantName}`,
					bold: false,
					size: fontSizeRegular
				})
			],
			spacing: { after: 200 } // Уменьшено для экономии места
		})
	)

	// 3. Заголовок
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			children: [
				new TextRun({
					text: 'МИРОВОЕ СОГЛАШЕНИЕ',
					bold: true,
					size: fontSizeHeader
				}),
				new TextRun({
					text: '\nпо делу о нарушении исключительных прав на товарный знак',
					bold: true,
					size: fontSizeRegular,
					break: 1
				})
			],
			spacing: { after: 200 }
		})
	)

	// 4. Преамбула
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({ text: 'Мы, стороны по делу:', size: fontSizeRegular })
			],
			spacing: { after: 80 }
		})
	)

	// Список сторон
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: `1) Истец — ${data.plaintiffName};`,
					size: fontSizeRegular
				})
			]
		}),
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: `2) Ответчик — ${data.defendantName},`,
					size: fontSizeRegular
				})
			],
			spacing: { after: 100 }
		})
	)

	// 3. Финальная фраза
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'заключили настоящее мировое соглашение о нижеследующем.',
					size: fontSizeRegular
				})
			],
			spacing: { after: 100 }
		})
	)

	// 5. Описание спора
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: `Стороны договорились урегулировать спор, возникший из факта реализации Ответчиком товара с признаками нарушения исключительного права на товарный знак: ${data.trademark}.`,
					size: fontSizeRegular
				})
			],
			spacing: { after: 100 }
		})
	)

	// 6. Пункты соглашения (1-4)
	const terms = [
		{
			title:
				'1. Ответчик обязуется прекратить нарушение исключительного права, в том числе:',
			subPoints: [
				'прекратить реализацию (предложение к продаже) товара с незаконной маркировкой/обозначением;',
				'обеспечить снятие соответствующей продукции из оборота и прекращение дальнейшего распространения.'
			]
		},
		{
			title: `2. Ответчик обязуется выплатить Истцу компенсацию/денежные средства в размере ${data.amount} руб. в срок до ${data.deadline}.`
		},
		{
			title:
				'3. Ответчик обязуется представить Истцу подтверждающие документы о прекращении нарушения и мерах по изъятию товара из оборота (при наличии остатков).'
		},
		{
			title:
				'4. Стороны подтверждают, что условия соглашения являются добровольными и направлены на прекращение спора по делу.'
		}
	]

	terms.forEach(term => {
		children.push(
			new Paragraph({
				alignment: AlignmentType.JUSTIFY,
				children: [new TextRun({ text: term.title, size: fontSizeRegular })],
				spacing: { before: 80, after: 50 }
			})
		)

		if (term.subPoints) {
			term.subPoints.forEach(sub => {
				children.push(
					new Paragraph({
						alignment: AlignmentType.JUSTIFY,
						children: [
							new TextRun({
								text: `—\t${sub}`,
								size: fontSizeRegular
							})
						],
						tabStops: [{ type: TabStopType.LEFT, position: 300 }],
						indent: { left: 300, hanging: 300 },
						spacing: { after: 20 }
					})
				)
			})
		}
	})

	// 7. Юридические последствия
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'В случае утверждения мирового соглашения судом производство по делу подлежит прекращению в порядке, установленном процессуальным законодательством (в том числе ст. 138–139 АПК РФ / в зависимости от вида судопроизводства).',
					size: fontSizeRegular
				})
			],
			spacing: { before: 150, after: 80 }
		}),
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'Настоящее мировое соглашение вступает в силу с момента его утверждения судом.',
					size: fontSizeRegular
				})
			],
			spacing: { after: 200 }
		})
	)

	// 8. Подписи
	children.push(
		new Paragraph({
			children: [
				new TextRun({
					text: 'Подписи сторон:',
					bold: false,
					size: fontSizeRegular
				})
			],
			spacing: { after: 150 }
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: 'Истец: ____________________',
					size: fontSizeRegular
				})
			],
			spacing: { after: 100 }
		}),
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: 'Ответчик: ____________________',
					size: fontSizeRegular
				})
			],
			spacing: { after: 50 }
		})
	)

	return children
}

module.exports = settlementTemplate
