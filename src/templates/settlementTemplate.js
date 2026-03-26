const { Paragraph, TextRun, AlignmentType, UnderlineType } = require('docx')

/**
 * Шаблон Мирового соглашения
 * Воспроизводит структуру документа text_mirovoe_soglashenie.docx
 */
async function settlementTemplate(data) {
	const children = []

	// 1. Дата и Суд (Верхняя часть)
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: `Дата мирового соглашения:  ${data.date}.`,
					bold: true
				})
			],
			spacing: { after: 200 }
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: `${data.courtName || 'Арбитражный суд Ростовской области'}`,
					bold: true
				}),
				new TextRun({
					text: `\nАдрес суда:  ${data.courtAddress || '344002, (г.Ростов-на-Дону, ул.Станиславского, 8 «а»)'}`,
					break: 1
				})
			],
			spacing: { after: 300 }
		})
	)

	// 2. Стороны (Истец и Ответчик) [cite: 35-37]
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: `Истец:  ${data.plaintiffName || '(Пума СЕ)'}`,
					bold: true
				}),
				new TextRun({
					text: `\nОтветчик: ${data.defendantName || '(ИП Иванов Иван Иванович)'}`,
					bold: true,
					break: 1
				}),
				new TextRun({
					text: `\n(ИНН: ${data.sellerInn || '000000'}), (ОГРН: ${data.sellerOgrn || '0000000'})`,
					break: 1
				})
			],
			spacing: { after: 400 }
		})
	)

	// 3. Заголовок [cite: 38-39]
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			children: [
				new TextRun({ text: 'МИРОВОЕ СОГЛАШЕНИЕ', bold: true, size: 28 }),
				new TextRun({
					text: '\nпо делу о нарушении исключительных прав на товарный знак',
					bold: true,
					break: 1
				})
			],
			spacing: { after: 400 }
		})
	)

	// 4. Преамбула [cite: 40-43]
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({ text: 'Мы, стороны по делу:' }),
				new TextRun({
					text: `\n1) Истец — ${data.plaintiffName || '(Пума СЕ)'};`,
					break: 1
				}),
				new TextRun({
					text: `\n2) Ответчик — ${data.defendantName || '(ИП Иванов Иван Иванович)'},`,
					break: 1
				}),
				new TextRun({
					text: '\nзаключили настоящее мировое соглашение о нижеследующем.',
					break: 1
				})
			],
			spacing: { after: 200 }
		})
	)

	// 5. Описание спора [cite: 44]
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: `Стороны договорились урегулировать спор, возникший из факта реализации Ответчиком товара с признаками нарушения исключительного права на товарный знак: ${data.trademark || '(11111, 22222, 33333)'}.`
				})
			],
			spacing: { after: 200 }
		})
	)

	// 6. Пункты соглашения (1-4) [cite: 45-50]
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
			title: `2. Ответчик обязуется выплатить Истцу компенсацию/денежные средства в размере ${data.amount || '(1000000)'} руб. в срок до ${data.deadline || '(25.12.2025)'}.`
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
				children: [new TextRun({ text: term.title })],
				spacing: { before: 150 }
			})
		)
		if (term.subPoints) {
			term.subPoints.forEach(sub => {
				children.push(
					new Paragraph({
						alignment: AlignmentType.JUSTIFY,
						children: [new TextRun({ text: `— ${sub}` })],
						indent: { left: 400 }
					})
				)
			})
		}
	})

	// 7. Юридические последствия [cite: 51-52]
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: '\nВ случае утверждения мирового соглашения судом производство по делу подлежит прекращению в порядке, установленном процессуальным законодательством (в том числе ст. 138–139 АПК РФ / в зависимости от вида судопроизводства).',
					break: 1
				}),
				new TextRun({
					text: '\nНастоящее мировое соглашение вступает в силу с момента его утверждения судом.',
					break: 1
				})
			],
			spacing: { before: 200, after: 400 }
		})
	)

	// 8. Подписи
	children.push(
		new Paragraph({
			children: [new TextRun({ text: 'Подписи сторон:', bold: true })],
			spacing: { after: 200 }
		})
	)

	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({ text: 'Истец: ____________' }),
				new TextRun({ text: '\t\t\t\t\t' }), // Табуляция для разноса подписей
				new TextRun({ text: 'Ответчик: ____________' })
			]
		})
	)

	return children
}

module.exports = settlementTemplate
