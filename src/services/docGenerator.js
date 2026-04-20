const {
	Document,
	Packer,
	Paragraph,
	ImageRun,
	AlignmentType,
	Table,
	TableRow,
	TableCell,
	WidthType,
	BorderStyle,
	VerticalAlign,
	TextRun
} = require('docx')
const fs = require('fs')
const path = require('path')

class DocGenerator {
	static async createDocument(children, docType = 'other') {
		const assetsPath = path.join(__dirname, '..', 'assets', 'images')
		const logoPath = path.join(assetsPath, 'black_logo.png')

		let logoRun = new TextRun('')
		if (fs.existsSync(logoPath)) {
			logoRun = new ImageRun({
				data: fs.readFileSync(logoPath),
				// Увеличен размер логотипа
				transformation: { width: 170, height: 60 },
				type: 'png'
			})
		}

		const headerTable = new Table({
			width: { size: 100, type: WidthType.PERCENTAGE },
			borders: {
				top: { style: BorderStyle.NONE },
				bottom: { style: BorderStyle.NONE },
				left: { style: BorderStyle.NONE },
				right: { style: BorderStyle.NONE },
				insideHorizontal: { style: BorderStyle.NONE },
				insideVertical: { style: BorderStyle.NONE }
			},
			rows: [
				new TableRow({
					children: [
						new TableCell({
							// Уменьшена ширина ячейки лого, чтобы перегородка была ближе
							width: { size: 25, type: WidthType.PERCENTAGE },
							verticalAlign: VerticalAlign.CENTER,
							borders: {
								right: {
									style: BorderStyle.SINGLE,
									size: 4,
									color: '000000' // Черная перегородка
								},
								top: { style: BorderStyle.NONE },
								bottom: { style: BorderStyle.NONE },
								left: { style: BorderStyle.NONE }
							},
							children: [
								new Paragraph({
									children: [logoRun],
									alignment: AlignmentType.CENTER,
									spacing: { before: 0, after: 0 }
								})
							]
						}),
						new TableCell({
							width: { size: 75, type: WidthType.PERCENTAGE },
							verticalAlign: VerticalAlign.CENTER,
							children: [
								new Paragraph({
									alignment: AlignmentType.CENTER,
									spacing: { before: 0, after: 0 },
									children: [
										new TextRun({
											text: 'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ',
											size: 24, // Шрифт 12 (24 твипа)
											font: 'Times New Roman'
										}),
										new TextRun({
											text: '«ЮРИДИЧЕСКАЯ КОМПАНИЯ «ШЕВЧЕНКО И ПАРТНЕРЫ»',
											size: 24,
											font: 'Times New Roman',
											break: 1
										}),
										new TextRun({
											text: 'ИНН 6164118059 КПП 616101001 344082,',
											size: 24,
											font: 'Times New Roman',
											break: 1
										}),
										new TextRun({
											text: 'г. Ростов-на-Дону, ул. Максима Горького 44 «б», к. 1',
											size: 24,
											font: 'Times New Roman',
											break: 1
										})
									]
								})
							]
						})
					]
				})
			]
		})

		const finalChildren = [
			headerTable,
			new Paragraph({ text: '', spacing: { after: 200 } }),
			...children
		]

		const doc = new Document({
			sections: [
				{
					properties: {
						page: {
							margin: {
								top: 1134, // 2 см
								bottom: 1134, // 2 см
								left: 1701, // 3 см
								right: 850 // 1.5 см
							}
						}
					},
					children: finalChildren
				}
			]
		})

		return await Packer.toBuffer(doc)
	}
}

module.exports = DocGenerator
