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
	const formatDate = dateStr => {
		if (!dateStr) return ''
		const [year, month, day] = dateStr.split('-')
		return `${day}.${month}.${year}`
	}

	// В блоке формирования docx:

	// 1. Дата и Суд (Верхняя часть)
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({ text: 'Дата мирового соглашения: ', bold: true }),
				new TextRun({ text: `${formatDate(data.date)}г.`, bold: false })
			],
			spacing: { before: 200, after: 100 }
		})
	)

	// 2. Суд и Адрес (разделяем на разные параграфы для четкости)
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [new TextRun({ text: `${data.courtName}`, bold: true })],
			spacing: { after: 50 }
		}),
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({ text: 'Адрес суда: ', bold: true }),
				new TextRun({ text: `${data.courtAddress}`, bold: false })
			],
			spacing: { after: 200 }
		})
	)

	// 2. Стороны (Истец и Ответчик) [cite: 35-37]
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({ text: 'Истец: ', bold: true }),
				new TextRun({ text: `${data.plaintiffName}`, bold: false })
			],
			spacing: { after: 50 }
		}),
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({ text: 'Ответчик: ', bold: true }),
				new TextRun({ text: `${data.defendantName}`, bold: false })
			],
			spacing: { after: 600 }
		})
	)

	// // 4. Реквизиты ответчика (ИНН/ОГРН) отдельной строкой
	// children.push(
	// 	new Paragraph({
	// 		alignment: AlignmentType.LEFT,
	// 		children: [
	// 			new TextRun({
	// 				text: `(ИНН: ${data.sellerInn}), (ОГРН: ${data.sellerOgrn})`,
	// 				bold: false
	// 			})
	// 		],
	// 		spacing: { after: 600 } // Большой отступ перед заголовком "МИРОВОЕ СОГЛАШЕНИЕ"
	// 	})
	// )

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
			children: [new TextRun({ text: 'Мы, стороны по делу:' })],
			spacing: { after: 120 } // Небольшой отступ перед списком
		})
	)

	// 2. Список сторон (используем отдельные параграфы для четких строк)
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [new TextRun({ text: `1) Истец — ${data.plaintiffName};` })]
		}),
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [new TextRun({ text: `2) Ответчик — ${data.defendantName},` })],
			spacing: { after: 200 } // Тот самый отступ ПЕРЕД "заключили..."
		})
	)

	// 3. Финальная фраза
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'заключили настоящее мировое соглашение о нижеследующем.'
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
					text: `Стороны договорились урегулировать спор, возникший из факта реализации Ответчиком товара с признаками нарушения исключительного права на товарный знак: ${data.trademark}.`
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
		// 1. Основной пункт (заголовок)
		children.push(
			new Paragraph({
				alignment: AlignmentType.JUSTIFY,
				children: [new TextRun({ text: term.title })],
				spacing: { before: 150, after: 120 }
			})
		)

		// 2. Подпункты (тире ровно под цифрой 1)
		if (term.subPoints) {
			term.subPoints.forEach(sub => {
				children.push(
					new Paragraph({
						alignment: AlignmentType.JUSTIFY,
						children: [
							new TextRun({
								text: `—\t${sub}` // Оставляем ОДИН символ табуляции
							})
						],
						tabStops: [
							{
								type: TabStopType.LEFT,
								position: 300 // Точка, где начинается текст после тире
							}
						],
						indent: {
							left: 300, // Весь блок текста смещен на 300
							hanging: 300 // Первая строка (с тире) выносится влево на те же 300
						}
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
					text: 'В случае утверждения мирового соглашения судом производство по делу подлежит прекращению в порядке, установленном процессуальным законодательством (в том числе ст. 138–139 АПК РФ / в зависимости от вида судопроизводства).'
				})
			],
			spacing: { before: 400, after: 200 } // Отступ перед блоком и между абзацами
		}),
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'Настоящее мировое соглашение вступает в силу с момента его утверждения судом.'
				})
			],
			spacing: { after: 400 } // Увеличенный отступ перед "Подписи сторон"
		})
	)

	// 8. Подписи
	children.push(
		new Paragraph({
			children: [new TextRun({ text: 'Подписи сторон:', bold: false })],
			spacing: { after: 300 }
		})
	)

	// Истец и Ответчик (каждый в своем параграфе для вертикального списка)
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [new TextRun({ text: 'Истец: ____________________' })], // Удлинил линию для соответствия макету
			spacing: { after: 200 }
		}),
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [new TextRun({ text: 'Ответчик: ____________________' })],
			spacing: { after: 200 }
		})
	)

	return children
}

module.exports = settlementTemplate
