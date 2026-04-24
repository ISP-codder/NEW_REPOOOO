const {
    Paragraph,
    TextRun,
    AlignmentType,
    TabStopType,
    TabStopPosition,
    ImageRun
} = require('docx')
const fs = require('fs');
const path = require('path');

async function settlementTemplate(data) {
    const children = []

    const fontSizeRegular = 24
    const fontSizeHeader = 28

    const formatDate = dateStr => {
        if (!dateStr) return ''
        const [year, month, day] = dateStr.split('-')
        return `${day}.${month}.${year}`
    }

    // 1. Дата
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

    // 2. Шапка (Суд, Истец, Ответчик)
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
                new TextRun({ text: 'Адрес суда: ', bold: true, size: fontSizeRegular }),
                new TextRun({ text: `${data.courtAddress}`, size: fontSizeRegular })
            ],
            spacing: { after: 100 }
        }),
        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({ text: 'Истец: ', bold: true, size: fontSizeRegular }),
                new TextRun({ text: `${data.plaintiffName}`, size: fontSizeRegular })
            ],
            spacing: { after: 20 }
        }),
        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({ text: 'Ответчик: ', bold: true, size: fontSizeRegular }),
                new TextRun({ text: `${data.defendantName}`, size: fontSizeRegular })
            ],
            spacing: { after: 20 }
        }),
        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({ text: 'Юридический адрес: ', bold: true, size: fontSizeRegular }),
                new TextRun({ text: `${data.respondent}`, size: fontSizeRegular })
            ],
            spacing: { after: 200 }
        })
    )

    // 3. Заголовок
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: 'МИРОВОЕ СОГЛАШЕНИЕ', bold: true, size: fontSizeHeader }),
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

    // 4. Вводная часть (с отступом 1.25)
    children.push(
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({ text: 'Мы, стороны по делу:', size: fontSizeRegular })
            ],
            spacing: { after: 80 }
        })
    )

    children.push(
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({ text: `1) Истец — ${data.plaintiffName};`, size: fontSizeRegular })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({ text: `2) Ответчик — ${data.defendantName},`, size: fontSizeRegular })
            ],
            spacing: { after: 100 }
        }),
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({ text: 'заключили настоящее мировое соглашение о нижеследующем.', size: fontSizeRegular })
            ],
            spacing: { after: 200 }
        })
    )

    // 5. Суть спора (с отступом 1.25)
    children.push(
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    text: `Стороны договорились урегулировать спор, возникший из факта реализации Ответчиком товара с признаками нарушения исключительного права на товарный знак: ${data.trademark}`,
                    size: fontSizeRegular
                })
            ],
            spacing: { after: 200 }
        })
    )

    // 6. Пункты соглашения
    const terms = [
        {
            title: '1. Ответчик обязуется прекратить нарушение исключительного права, в том числе:',
            subPoints: [
                'прекратить реализацию (предложение к продаже) товара с незаконной маркировкой/обозначением;',
                'обеспечить снятие соответствующей продукции из оборота и прекращение дальнейшего распространения.'
            ]
        },
        { title: `2. Ответчик обязуется выплатить Истцу компенсацию в размере ${data.amount} руб. в срок до ${data.deadline}.` },
        { title: '3. Ответчик обязуется представить Истцу подтверждающие документы о прекращении нарушения.' },
        { title: '4. Стороны подтверждают, что условия соглашения являются добровольными.' }
    ]

    terms.forEach(term => {
        children.push(
            new Paragraph({
                alignment: AlignmentType.JUSTIFY,
                children: [
                    new TextRun({
                        text: `${term.title.split('. ')[0]}.\t${term.title.split('. ').slice(1).join('. ')}`,
                        size: fontSizeRegular
                    })
                ],
                tabStops: [{ type: TabStopType.LEFT, position: 450 }],
                indent: { left: 450, hanging: 450 },
                spacing: { before: 150, after: 100 }
            })
        )

        if (term.subPoints) {
            term.subPoints.forEach(sub => {
                children.push(
                    new Paragraph({
                        alignment: AlignmentType.JUSTIFY,
                        children: [new TextRun({ text: `—\t${sub}`, size: fontSizeRegular })],
                        tabStops: [{ type: TabStopType.LEFT, position: 450 }],
                        indent: { left: 450, hanging: 450 },
                        spacing: { after: 100 }
                    })
                )
            })
        }
    })

    // 7. Заключение (с отступом 1.25)
    children.push(
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    text: 'В случае утверждения мирового соглашения судом производство по делу подлежит прекращению в порядке, установленном процессуальным законодательством (в том числе ст. 138–139 АПК РФ).',
                    size: fontSizeRegular
                })
            ],
            spacing: { before: 150, after: 150 }
        }),
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({ text: 'Настоящее мировое соглашение вступает в силу с момента его утверждения судом.', size: fontSizeRegular })
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
	try {
		const signaturePath = path.join(
			__dirname,
			'..',
			'assets',
			'images',
			'signature.png'
		)
		const printPath = path.join(
			__dirname,
			'..',
			'assets',
			'images',
			'print.png'
		)

		const signatureExists = fs.existsSync(signaturePath)
		const printExists = fs.existsSync(printPath)

		if (signatureExists || printExists) {
			children.push(
				new Paragraph({
					alignment: AlignmentType.LEFT,
					spacing: { before: 200, after: 200 },
					children: [
						...(signatureExists
							? [
									new ImageRun({
										data: fs.readFileSync(signaturePath),
										transformation: { width: 60, height: 60 },
										type: 'png'
									})
								]
							: []),
						...(printExists
							? [
									new ImageRun({
										data: fs.readFileSync(printPath),
										transformation: { width: 100, height: 80 },
										type: 'png'
									})
								]
							: [])
					]
				})
			)
		}
	} catch (e) {
		console.error('Ошибка при добавлении подписи/печати:', e)
	}
	return children
}

module.exports = settlementTemplate
