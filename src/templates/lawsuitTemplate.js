const { Paragraph, TextRun, AlignmentType, ImageRun } = require('docx')
const { processImage } = require('../utils/imageProcessor')

async function lawsuitTemplate(data, photos) {
	const children = []

	// --- 1. ШАПКА ПО ОБРАЗЦУ (Справа) ---
	// Добавлены полные реквизиты вашей компании из скриншота
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: `Арбитражный суд Ростовской области ${data.courtName}`,
					break: 2,
					bold: true
				}),
				new TextRun({
					text: `Адрес суда: ${data.courtAddress}`,
					break: 1
				}),
				new TextRun({
					text: `Истец: ${data.plaintiffName}`,
					break: 2,
					bold: true
				}),
				new TextRun({
					text: `Представитель истца: ${data.representativeName}`,
					break: 1
				}),
				new TextRun({
					text: `Ответчик: ${data.sellerName}`,
					break: 2,
					bold: true
				}),
				// Добавлены ИНН/ОГРН ответчика из скриншота [cite: 34]
				new TextRun({
					text: `ИНН: ${data.sellerInn}), (ОГРН: ${data.sellerOgrn}`,
					break: 1
				}),
				new TextRun({
					text: `Юридический адрес: ${data.sellerLegalAddress}`,
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
				new TextRun({ text: 'Исковое заявление', bold: true, size: 28 }),
				new TextRun({
					text: '\nо пресечении незаконного использования товарного знака и взыскании компенсации',
					break: 1,
					bold: true,
					size: 20
				})
			]
		})
	)

	// --- 3. ОПИСАТЕЛЬНАЯ ЧАСТЬ (ПО ОБРАЗЦУ 1-в-1) ---
	const bodyStyle = {
		alignment: AlignmentType.JUSTIFY,
		spacing: { before: 120 },
		indent: { firstLine: 450 }
	}

	// Добавлена отсутствующая строка из скриншота [cite: 38]
	children.push(
		new Paragraph({
			...bodyStyle,
			children: [
				new TextRun(
					`Истец является правообладателем товарный знак ${data.tmNumbers}.`
				)
			]
		})
	)

	// Добавлен полный текст из скриншота [cite: 39]
	children.push(
		new Paragraph({
			...bodyStyle,
			children: [
				new TextRun(
					`Из материалов дела следует, что ${data.purchaseDate} в торговой точке Ответчика ${data.shopName}, адрес: ${data.shopLocation}, ${data.shopStreet} реализовывался товар ${data.productCategory}, в количестве ${data.productCount}, стоимостью ${data.productPrice} рублей с признаками контрафактности.`
				),
				new TextRun({
					text: ' Использование спорного обозначения осуществлялось без разрешения Истца, чем нарушено исключительное право правообладателя.',
					break: 0
				})
			]
		})
	)

	// Добавлена отсутствующая строка из скриншота [cite: 41]
	children.push(
		new Paragraph({
			...bodyStyle,
			children: [
				new TextRun(
					'Нарушение подтверждается документами, прилагаемыми к иску. Ранее Истец направлял досудебную претензию, однако требования добровольно не исполнены.'
				)
			]
		})
	)

	// --- 4. ПРАВОВОЕ ОБОСНОВАНИЕ ---
	children.push(
		new Paragraph({
			...bodyStyle,
			children: [
				new TextRun({
					text: 'С учетом ст. 1229, 1252, 1484, 1515 ГК РФ, а также процессуальных норм ст. 131–132 ГПК РФ (или ст. 125–126 АПК РФ),',
					italic: true
				})
			]
		})
	)

	// --- 5. ТРЕБУЕМ ---
	children.push(
		new Paragraph({
			spacing: { before: 300, after: 100 },
			children: [new TextRun({ text: 'ТРЕБУЕМ:', bold: true })]
		})
	)

	const requests = [
		'1. Признать действия Ответчика нарушающими исключительные права Истца на товарный знак.',
		'2. Обязать Ответчика прекратить незаконное использование обозначения.',
		'3. Изъять из оборота и уничтожить контрафактный товар, а также предъявить доказательство уничтожения товара.',
		`4. Взыскать компенсацию в сумме ${data.productPrice * 10 || '1000000'} руб.`,
		'5. Взыскать судебные расходы, включая госпошлину и расходы на представителя.'
	]

	requests.forEach(text =>
		children.push(
			new Paragraph({ ...bodyStyle, children: [new TextRun(text)] })
		)
	)

	// Добавлена отсутствующая строка из скриншота
	children.push(
		new Paragraph({
			...bodyStyle,
			children: [
				new TextRun(
					'Истец предпринимал меры досудебного урегулирования, включая предложение добровольной оплаты (в том числе с использованием QR-кода), что подтверждает добросовестность поведения Истца.'
				)
			]
		})
	)

	children.push(
		new Paragraph({
			spacing: { before: 600 },
			children: [
				new TextRun({ text: 'С уважением,' }),
				new TextRun({ text: '\nООО «ЮК ШИП»', break: 1, bold: true })
			]
		})
	)

	return children
}

module.exports = lawsuitTemplate
