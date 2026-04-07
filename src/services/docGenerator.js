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
				transformation: { width: 150, height: 50 },
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
							width: { size: 30, type: WidthType.PERCENTAGE },
							verticalAlign: VerticalAlign.CENTER,
							borders: {
								right: {
									style: BorderStyle.SINGLE,
									size: 4,
									color: 'A6A6A6'
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
							width: { size: 70, type: WidthType.PERCENTAGE },
							children: [
								new Paragraph({
									alignment: AlignmentType.CENTER,
									spacing: { before: 0, after: 0 },
									children: [
										new TextRun({
											text: 'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ',
											size: 20
										}),
										new TextRun({
											text: '«ЮРИДИЧЕСКАЯ КОМПАНИЯ «ШЕВЧЕНКО И ПАРТНЕРЫ»',
											size: 20,
											break: 1
										}),
										new TextRun({
											text: 'ИНН 6164118059 КПП 616101001 344082,',
											size: 20,
											break: 1
										}),
										new TextRun({
											text: 'г. Ростов-на-Дону, ул. Максима Горького 44 «б», к. 1',
											size: 20,
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
			new Paragraph({ text: '', spacing: { after: 400 } }),
			...children
		]

		const doc = new Document({
			sections: [
				{
					children: finalChildren
				}
			]
		})

		return await Packer.toBuffer(doc)
	}
}

module.exports = DocGenerator
