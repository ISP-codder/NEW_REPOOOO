const {
	Paragraph,
	TextRun,
	AlignmentType,
	HeadingLevel,
	TabStopType
} = require('docx')

async function reportTemplate(data) {
	const children = []
	const formatDate = dateStr => {
		if (!dateStr) return ''
		const [year, month, day] = dateStr.split('-')
		return `${day}.${month}.${year}`
	}
	const font = 'Times New Roman'
	const sizeTitle = 28
	const sizeMain = 24
	const sizeHeader = 18

	const createPara = (text, options = {}) =>
		new Paragraph({
			alignment: options.align || AlignmentType.JUSTIFY,
			spacing: { before: 120, after: 120 },
			indent: { firstLine: 0 },
			children: [
				new TextRun({
					text,
					font: 'Times New Roman',
					size: sizeMain,
					bold: options.bold
				})
			]
		})

	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { before: 400, after: 200 },
			children: [
				new TextRun({ text: 'Отчет', bold: true, size: sizeTitle, font })
			]
		})
	)

	children.push(
		new Paragraph({
			children: [
				new TextRun({
					text: `Дата отчета: ${formatDate(data.reportDate)}г.`,
					size: sizeMain
				})
			]
		})
	)

	children.push(
		createPara(
			'В отчетном периоде проведен комплекс мероприятий по выявлению, документированию и пресечению фактов реализации контрафактной продукции, нарушающей исключительные права правообладателя на товарные знаки и иные средства индивидуализации. Работа осуществлялась в досудебном и судебном порядке в соответствии с положениями ст. 1229, 1252, 1484, 1515 ГК РФ, с учетом административной ответственности по ст. 14.10 КоАП РФ и, при наличии оснований, признаков состава по ст. 180 УК РФ.'
		)
	)

	children.push(
		createPara(
			`В рамках урегулирования споров во внесудебном порядке за отчетный период заключено ${data.settlementsCount} мировых соглашений. Общая сумма поступлений по указанным соглашениям составила ${data.settlementsSum} руб., что подтверждает эффективность досудебного механизма защиты прав и снижение судебных издержек.`
		)
	)

	children.push(
		createPara(
			`Одновременно с этим в целях пресечения продолжающихся нарушений и взыскания компенсации были подготовлены и направлены нарушителям претензионные материалы. Количество претензий, по которым инициировано судебное производство, составило ${data.claimsCount}. По делам, где досудебное урегулирование не привело к результату, в суд подано ${data.lawsuitsCount} исковых заявлений о защите исключительных прав, запрете реализации контрафактного товара, изъятии продукции из оборота и взыскании компенсации.`
		)
	)

	children.push(
		createPara('По итогам рассмотрения дел в судах за отчетный период:', {
			bold: true,
			noIndent: true
		})
	)

	const listItems = [
		`Количество дел, завершившихся не в пользу правообладателя (проигрыши), — ${data.lostCount};`,
		`Количество дел, завершившихся в пользу правообладателя (победы), — ${data.wonCount}.`
	]

	listItems.forEach((text, index) => {
		children.push(
			new Paragraph({
				alignment: AlignmentType.JUSTIFY,
				indent: { left: 360, hanging: 360 },
				tabStops: [{ type: TabStopType.LEFT, position: 360 }],
				children: [
					new TextRun({
						text: `${index + 1}.\t${text}`,
						font: 'Times New Roman',
						size: sizeMain
					})
				]
			})
		)
	})

	children.push(
		createPara(
			`Сумма присужденной/взысканной моральной компенсации за отчетный период составила ${data.compensationSum || '0'} руб. (при наличии соответствующих судебных актов и/или соглашений сторон).`
		)
	)

	children.push(
		createPara(
			`Исходя из совокупных финансовых показателей (поступления по мировым соглашениям, взысканные суммы и иные подтвержденные доходы за вычетом сопутствующих расходов), прибыль за месяц составила ${data.totalProfit} руб.`
		)
	)

	children.push(
		createPara(
			'Таким образом, результаты отчетного периода свидетельствуют о системной и результативной правоприменительной практике в сфере противодействия обороту контрафактной продукции. Претензионно-исковая работа позволила обеспечить защиту исключительных прав правообладателя, сократить объем незаконной реализации контрафактных товаров и сформировать устойчивую судебную позицию по аналогичным нарушениям.'
		)
	)

	children.push(
		new Paragraph({
			spacing: { before: 600 },
			children: [
				new TextRun({ text: 'С уважением,', font, size: sizeMain }),
				new TextRun({
					text: 'ООО «ЮК ШИП»',
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
