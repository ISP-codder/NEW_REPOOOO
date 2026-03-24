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
				type: 'png',
				alignment: VerticalAlign.BOTTOM
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
							children: [
								new Paragraph({
									VerticalAlign: VerticalAlign.BOTTOM,
									children: [logoRun],
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
											text: 'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ»',
											size: 24
										}),
										new TextRun({
											text: '\n«ЮРИДИЧЕСКАЯ КОМПАНИЯ «ШЕВЧЕНКО И ПАРТНЕРЫ»',
											size: 24,
											break: 1
										}),
										new TextRun({
											text: '\nИНН 6164118059 КПП 616101001 344082,',
											size: 24,
											break: 1
										}),
										new TextRun({
											text: '\nг. Ростов-на-Дону, ул. Максима Горького 44 «б», к. 1',
											size: 24,
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

		const headerChildren = [
			// Создаем "пустое пространство" сверху.
			// Увеличивай line, если нужно опустить таблицу еще ниже к тексту.
			new Paragraph({
				text: '',
				spacing: { before: 800 }
			}),
			headerTable
		]

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
