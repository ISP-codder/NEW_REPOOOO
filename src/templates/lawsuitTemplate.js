const {
	Paragraph,
	TextRun,
	AlignmentType,
	ImageRun,
	Table,
	TableRow,
	TableCell,
	WidthType,
	BorderStyle
} = require('docx')
const { processImage } = require('../utils/imageProcessor')

async function lawsuitTemplate(data, photos) {
	const children = []

	// --- 1. ШАПКА (Справа) ---
	children.push(
		new Paragraph({
			alignment: AlignmentType.RIGHT,
			children: [
				new TextRun({
					text: `В ${data.courtName || '[Наименование суда]'}`,
					bold: true
				}),
				new TextRun({
					text: `\n${data.courtAddress || '[Адрес суда]'}`,
					break: 1
				}),
				new TextRun({ text: `\nИстец: ООО ЮК ШИП`, break: 2, bold: true }),
				new TextRun({
					text: `\nАдрес: г. Москва, ул. Примерная, д. 1`,
					break: 1
				}), // Замени на реальный
				new TextRun({
					text: `\nИНН/ОГРН: 7712345678 / 1234567890123`,
					break: 1
				}),
				new TextRun({
					text: `\nТел: +7 (999) 000-00-00, e-mail: info@ukship.ru`,
					break: 1
				}),
				new TextRun({
					text: `\nОтветчик: ${data.sellerName || '[Наименование ответчика]'}`,
					break: 2,
					bold: true
				}),
				new TextRun({
					text: `\nАдрес: ${data.sellerAddress || '[Адрес]'}`,
					break: 1
				}),
				new TextRun({
					text: `\nОГРН/ИНН: ${data.sellerOgrn || '-'} / ${data.sellerInn || '-'}`,
					break: 1
				})
			]
		})
	)

	// --- 2. ЗАГОЛОВОК ---
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { before: 400, after: 200 },
			children: [
				new TextRun({ text: 'ИСКОВОЕ ЗАЯВЛЕНИЕ', bold: true, size: 28 }),
				new TextRun({
					text: '\nо защите исключительного права на товарный знак',
					break: 1,
					bold: true,
					size: 24
				})
			]
		})
	)

	// --- 3. ОПИСАТЕЛЬНАЯ ЧАСТЬ ---
	const bodyStyle = {
		alignment: AlignmentType.JUSTIFY,
		spacing: { before: 120 },
		indent: { firstLine: 450 }
	}

	children.push(
		new Paragraph({
			...bodyStyle,
			children: [
				new TextRun(
					`Ответчик осуществляет реализацию ${data.productCategory || '[описание товара]'} с маркировкой Товарным знаком, исключительное право на который принадлежит ${data.rightHolder || '[правообладатель]'}, что подтверждается материалами фиксации нарушения и документами приобретения.`
				)
			]
		})
	)

	const facts = [
		`1. Сведения о приобретении: ${data.purchaseDate || '[дата]'}, ${data.shopName || '[магазин]'}, ${data.shopLocation || '[адрес]'}.`,
		`2. Товар: ${data.productCategory || '[наименование]'}, ${data.productModel || '[артикул/модель]'}.`,
		`3. Проявления нарушения: ${data.productDetails || '[незаконное использование обозначения]'}.`,
		`4. Доказательства: чек №${data.claimNumber || '-'} от ${data.claimDate || '-'}, фото/видео материалы.`
	]

	facts.forEach(text =>
		children.push(
			new Paragraph({ ...bodyStyle, children: [new TextRun(text)] })
		)
	)

	children.push(
		new Paragraph({
			...bodyStyle,
			children: [
				new TextRun(
					`“${data.claimDate || '[дата]'}” Истец направил Ответчику претензию № ${data.claimNumber || '[ ]'}. `
				),
				new TextRun(
					`Ответ на претензию: ${data.claimResponse || 'не получен'}.`
				)
			]
		})
	)

	// --- 4. ПРАВОВОЕ ОБОСНОВАНИЕ ---
	const lawTexts = [
		'Согласно ст. 1252 ГК РФ защита исключительных прав включает пресечение нарушений и взыскание компенсации/убытков.',
		'В силу ст. 1484 ГК РФ использование товарного знака без надлежащих прав является нарушением исключительного права.',
		'Ответственность за нарушение исключительного права на товарный знак установлена ст. 1515 ГК РФ.'
	]

	lawTexts.forEach(text =>
		children.push(
			new Paragraph({
				...bodyStyle,
				children: [new TextRun({ text, italic: true })]
			})
		)
	)

	// --- 5. ПРОСИТЕЛЬНАЯ ЧАСТЬ ---
	children.push(
		new Paragraph({
			spacing: { before: 300, after: 100 },
			children: [
				new TextRun({
					text: 'На основании изложенного и руководствуясь ст. 1252, 1484, 1515 ГК РФ, прошу суд:',
					bold: true
				})
			]
		})
	)

	const requests = [
		'1. Признать действия Ответчика по реализации товара с незаконным использованием Товарного знака нарушающими исключительное право.',
		'2. Обязать Ответчика прекратить нарушение исключительного права на Товарный знак (запретить реализацию, изъять товары из оборота).',
		`3. Взыскать с Ответчика в пользу Истца компенсацию в размере ${data.totalSum || '0'} руб.`,
		`4. Взыскать судебные расходы в размере ${data.courtExpenses || '0'} руб. (в т.ч. расходы на фиксацию и представителя).`
	]

	requests.forEach(text =>
		children.push(
			new Paragraph({ ...bodyStyle, children: [new TextRun(text)] })
		)
	)

	// --- 6. ПРИЛОЖЕНИЯ И ФОТО ---
	children.push(
		new Paragraph({
			spacing: { before: 300 },
			children: [new TextRun({ text: 'Приложения:', bold: true })]
		})
	)

	const apps = [
		'1) Документы, подтверждающие направление претензии.',
		'2) Копии чека и доказательств приобретения.',
		'3) Фотоматериалы (см. ниже).',
		'4) Доверенность представителя.'
	]
	apps.forEach(text =>
		children.push(
			new Paragraph({ spacing: { before: 50 }, children: [new TextRun(text)] })
		)
	)

	// Вставка уменьшенных фото (как в Приложении)
	for (const [title, buffer] of Object.entries(photos)) {
		if (buffer && buffer.length > 0) {
			const cleanImg = await processImage(buffer)
			if (cleanImg) {
				children.push(
					new Paragraph({
						text: `Приложение: ${title}`,
						bold: true,
						spacing: { before: 200 }
					})
				)
				children.push(
					new Paragraph({
						alignment: AlignmentType.CENTER,
						children: [
							new ImageRun({
								data: cleanImg,
								transformation: { width: 300, height: 225 },
								type: 'jpg'
							})
						]
					})
				)
			}
		}
	}

	children.push(
		new Paragraph({
			spacing: { before: 600 },
			children: [
				new TextRun({ text: `“${new Date().toLocaleDateString('ru-RU')}”` }),
				new TextRun({
					text: '\t\t\t\t_____________________ /Петров П.П./',
					break: 0
				})
			]
		})
	)

	children.push(
		new Paragraph({
			spacing: { before: 200 },
			children: [
				new TextRun({ text: 'С уважением, ООО ЮК ШИП', bold: true }),
				new TextRun({
					text: '\n_____________________ /Иванов И.И./',
					break: 1
				}),
				new TextRun({ text: '\nГенеральный директор', break: 1 }),
				new TextRun({ text: '\nМ.П.', break: 1 })
			]
		})
	)

	return children
}

module.exports = lawsuitTemplate
