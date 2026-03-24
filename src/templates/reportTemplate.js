const { Paragraph, TextRun, AlignmentType, HeadingLevel } = require('docx')

async function reportTemplate(data) {
	const children = []

	// Настройки шрифта
	const font = 'Times New Roman'
	const sizeTitle = 28 // ~14pt
	const sizeMain = 24 // ~12pt
	const sizeHeader = 18 // ~9pt для шапки

	// Вспомогательная функция для создания стандартных абзацев
	const createPara = (text, options = {}) =>
		new Paragraph({
			alignment: options.align || AlignmentType.JUSTIFY,
			spacing: { before: 120, after: 120 },
			indent: options.noIndent ? {} : { firstLine: 450 },
			children: [
				new TextRun({ text, font, size: sizeMain, bold: options.bold })
			]
		})

	// --- 1. ШАПКА (Справа) ---
	children.push(
		new Paragraph({
			alignment: AlignmentType.RIGHT,
			children: [
				new TextRun({
					text: 'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ',
					size: sizeHeader,
					font
				}),
				new TextRun({
					text: '\n«ЮРИДИЧЕСКАЯ КОМПАНИЯ «ШЕВЧЕНКО И ПАРТНЕРЫ»',
					bold: true,
					size: sizeHeader,
					break: 1,
					font
				}),
				new TextRun({
					text: '\nИНН 6164118059 КПП 616101001 344082,',
					size: sizeHeader,
					break: 1,
					font
				}),
				new TextRun({
					text: '\nг. Ростов-на-Дону, ул. Максима Горького 44 «б», к. 1',
					size: sizeHeader,
					break: 1,
					font
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
				new TextRun({ text: 'ОТЧЕТ', bold: true, size: sizeTitle, font })
			]
		})
	)

	// --- 3. ДАТА ---
	children.push(
		new Paragraph({
			children: [
				new TextRun({
					text: `Дата отчета: (${data.reportDate || '30.12.2025 г.'}).`,
					font,
					size: sizeMain
				})
			]
		})
	)

	// --- 4. ВВОДНЫЙ ТЕКСТ ---
	children.push(
		createPara(
			'В отчетном периоде проведен комплекс мероприятий по выявлению, документированию и пресечению фактов реализации контрафактной продукции, нарушающей исключительные права правообладателя на товарные знаки и иные средства индивидуализации. Работа осуществлялась в досудебном и судебном порядке в соответствии с положениями ст. 1229, 1252, 1484, 1515 ГК РФ, с учетом административной ответственности по ст. 14.10 КоАП РФ и, при наличии оснований, признаков состава по ст. 180 УК РФ.'
		)
	)

	// --- 5. МИРОВЫЕ СОГЛАШЕНИЯ ---
	children.push(
		createPara(
			`В рамках урегулирования споров во внесудебном порядке за отчетный период заключено (${data.settlementsCount || '0'}) мировых соглашений. Общая сумма поступлений по указанным соглашениям составила (${data.settlementsSum || '0'}) руб., что подтверждает эффективность досудебного механизма защиты прав и снижение судебных издержек.`
		)
	)

	// --- 6. ПРЕТЕНЗИИ И ИСКИ ---
	children.push(
		createPara(
			`Одновременно с этим в целях пресечения продолжающихся нарушений и взыскания компенсации были подготовлены и направлены нарушителям претензионные материалы. Количество претензий, по которым инициировано судебное производство, составило (${data.claimsCount || '0'}). По делам, где досудебное урегулирование не привело к результату, в суд подано (${data.lawsuitsCount || '0'}) исковых заявлений о защите исключительных прав, запрете реализации контрафактного товара, изъятии продукции из оборота и взыскании компенсации.`
		)
	)

	// --- 7. РЕЗУЛЬТАТЫ В СУДАХ (СПИСОК) ---
	children.push(
		createPara('По итогам рассмотрения дел в судах за отчетный период:', {
			bold: true,
			noIndent: true
		})
	)

	const listItems = [
		`Количество дел, завершившихся не в пользу правообладателя (проигрыши), — (${data.lostCount || '0'});`,
		`Количество дел, завершившихся в пользу правообладателя (победы), — (${data.wonCount || '0'}).`
	]

	listItems.forEach((text, index) => {
		children.push(
			new Paragraph({
				indent: { left: 720, hanging: 360 },
				children: [
					new TextRun({
						text: `${index + 1}.    ${text}`,
						font,
						size: sizeMain
					})
				]
			})
		)
	})

	// --- 8. КОМПЕНСАЦИЯ И ПРИБЫЛЬ ---
	children.push(
		createPara(
			`Сумма присужденной/взысканной моральной компенсации за отчетный период составила (${data.compensationSum || '0'}) руб. (при наличии соответствующих судебных актов и/или соглашений сторон).`
		)
	)

	children.push(
		createPara(
			`Исходя из совокупных финансовых показателей (поступления по мировым соглашениям, взысканные суммы и иные подтвержденные доходы за вычетом сопутствующих расходов), прибыль за месяц составила ${data.totalProfit || '0'} руб.`
		)
	)

	// --- 9. ВЫВОД ---
	children.push(
		createPara(
			'Таким образом, результаты отчетного периода свидетельствуют о системной и результативной правоприменительной практике в сфере противодействия обороту контрафактной продукции. Претензионно-исковая работа позволила обеспечить защиту исключительных прав правообладателя, сократить объем незаконной реализации контрафактных товаров и сформировать устойчивую судебную позицию по аналогичным нарушениям.'
		)
	)

	// --- 10. ПОДПИСЬ ---
	children.push(
		new Paragraph({
			spacing: { before: 800 },
			children: [
				new TextRun({ text: 'С уважением,', font, size: sizeMain }),
				new TextRun({
					text: '\nООО «ЮК ШИП»',
					bold: true,
					break: 1,
					font,
					size: sizeMain
				})
			]
		})
	)

	return children
}

module.exports = reportTemplate
