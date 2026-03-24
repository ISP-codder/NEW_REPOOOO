const {
	Paragraph,
	TextRun,
	AlignmentType,
	ImageRun,
	Table,
	TableRow,
	TableCell,
	WidthType,
	BorderStyle,
	VerticalAlign,
	Header
} = require('docx')
const { processImage } = require('../utils/imageProcessor')

async function claimTemplate(data, photos) {
	const children = []

	// 1. Шапка получателя (справа)
	children.push(
		new Paragraph({
			alignment: AlignmentType.RIGHT,
			children: [
				new TextRun({ text: `Кому: ${data.sellerName || ''}`, bold: true }),
				new TextRun({ text: `\nИНН: ${data.sellerInn || ''}`, break: 1 }),
				new TextRun({
					text: `\nАдрес: ${data.shopLocation || ''}, ${data.shopStreet || ''}`,
					break: 1
				})
			],
			spacing: { before: 400, after: 400 }
		})
	)

	// 2. Заголовок
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { after: 400 },
			children: [
				new TextRun({ text: 'ДОСУДЕБНАЯ ПРЕТЕНЗИЯ', bold: true, size: 28 })
			]
		})
	)

	// 3. Основной текст (из примера)
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({ text: `Уважаемый(ая) ${data.sellerName || ''},` }),
				new TextRun({
					text: `\nНастоящей претензией заявляем о факте нарушения исключительных прав.`,
					break: 1
				}),
				new TextRun({
					text: `\nВ ходе закупки зафиксирована продажа товара (${data.productCategory || ''}).`,
					break: 1
				})
			],
			spacing: { line: 360 }
		})
	)

	// 4. Вставка фото
	for (const [title, buffer] of Object.entries(photos)) {
		if (buffer && buffer.length > 0) {
			const cleanImg = await processImage(buffer)
			if (cleanImg) {
				children.push(
					new Paragraph({ text: title, bold: true, spacing: { before: 300 } })
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

	return children // Возвращаем просто массив, как раньше
}

module.exports = claimTemplate
