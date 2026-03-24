const {
	Document,
	Packer,
	Paragraph,
	ImageRun,
	AlignmentType,
	Header,
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
		const qrPath = path.join(assetsPath, 'static-qr.png')

		// --- КОЛОНТИТУЛ (Всегда с логотипом) ---
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
							width: { size: 50, type: WidthType.PERCENTAGE },
							children: [new Paragraph({ children: [logoRun] })]
						}),
						new TableCell({
							width: { size: 50, type: WidthType.PERCENTAGE },
							children: [
								new Paragraph({
									alignment: AlignmentType.RIGHT,
									children: [
										new TextRun({ text: 'ООО «ЮК ШИП»', bold: true, size: 16 }),
										new TextRun({
											text: '\nИНН 6164118059',
											size: 14,
											break: 1
										}),
										new TextRun({
											text: '\nг. Ростов-на-Дону',
											size: 14,
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

		// --- QR-КОД (Только для Претензий и Уведомлений) ---
		const needsQR = ['claim', 'notification'].includes(docType)
		if (needsQR && fs.existsSync(qrPath)) {
			children.push(new Paragraph({ spacing: { before: 400 } }))
			children.push(
				new Paragraph({
					alignment: AlignmentType.CENTER,
					children: [
						new ImageRun({
							data: fs.readFileSync(qrPath),
							transformation: { width: 75, height: 75 },
							type: 'png'
						})
					]
				})
			)
		}

		const doc = new Document({
			sections: [
				{
					headers: { default: new Header({ children: [headerTable] }) },
					children: children
				}
			]
		})

		return await Packer.toBuffer(doc)
	}
}

module.exports = DocGenerator
