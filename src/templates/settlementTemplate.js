const {
	Paragraph,
	TextRun,
	AlignmentType,
	TabStopType,
	TabStopPosition
} = require('docx')

async function settlementTemplate(data) {
	const children = []

	const fontSizeRegular = 24
	const fontSizeHeader = 28

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
					text: 'Дата мирового соглашения: ',
					bold: true,
					size: fontSizeRegular
				}),
				new TextRun({
					text: `${formatDate(data.date)} г.`,
					bold: false,
					size: fontSizeRegular
				})
			],
			spacing: { before: 100, after: 50 }
		})
	)

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
			spacing: { after: 20 }
		}),
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: 'Юридический адрес: ',
					bold: true,
					size: fontSizeRegular
				}),
				new TextRun({
					text: `${data.respondent}`,
					bold: false,
					size: fontSizeRegular
				})
			],
			spacing: { after: 200 }
		})
	)

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
					size: fontSizeHeader,
					break: 1
				})
			],
			spacing: { after: 200 }
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({ text: 'Мы, стороны по делу:', size: fontSizeRegular })
			],
			spacing: { after: 80 }
		})
	)

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

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'заключили настоящее мировое соглашение о нижеследующем.',
					size: fontSizeRegular
				})
			],
			spacing: { after: 200 }
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: `Стороны договорились урегулировать спор, возникший из факта реализации Ответчиком товара с признаками нарушения исключительного права на товарный знак: ${data.trademark}`,
					size: fontSizeRegular
				})
			],
			spacing: { after: 200 }
		})
	)

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
		// 1. Основные пункты 1, 2, 3, 4
		children.push(
			new Paragraph({
				alignment: AlignmentType.JUSTIFY,
				children: [
					new TextRun({
						// Разделяем номер и текст табуляцией
						text: `${term.title.split('. ')[0]}.\t${term.title.split('. ').slice(1).join('. ')}`,
						size: fontSizeRegular
					})
				],
				// position: 450 — текст после цифры станет в 2 раза ближе
				tabStops: [{ type: TabStopType.LEFT, position: 450 }],
				// left: 450 (отступ блока), hanging: 450 (вынос цифры влево к краю)
				indent: { left: 450, hanging: 450 },
				spacing: { before: 150, after: 100 }
			})
		)

		// 2. Подпункты с длинным тире
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
						// position: 450 — текст после тире станет в 2 раза ближе
						tabStops: [{ type: TabStopType.LEFT, position: 450 }],
						indent: { left: 450, hanging: 450 },
						spacing: { after: 100 }
					})
				)
			})
		}
	})

	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'В случае утверждения мирового соглашения судом производство по делу подлежит прекращению в порядке, установленном процессуальным законодательством (в том числе ст. 138–139 АПК РФ / в зависимости от вида судопроизводства).',
					size: fontSizeRegular
				})
			],
			spacing: { before: 150, after: 150 }
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
