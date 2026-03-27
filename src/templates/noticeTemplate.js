const {
	Paragraph,
	TextRun,
	AlignmentType,
	ImageRun,
	HorizontalPositionAlign,
	TabStopType
} = require('docx')
const fs = require('fs')
const path = require('path')
const { processImage } = require('../utils/imageProcessor')

async function notificationTemplate(data, photos) {
	const children = []
	const formatDate = dateStr => {
		if (!dateStr) return ''
		const [year, month, day] = dateStr.split('-')
		return `${day}.${month}.${year}`
	}
	// 1. Блок "Кому" (выравнивание по правому краю)
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({
					text: 'Кому: ',
					bold: true,
					size: 24,
					font: 'Times New Roman'
				}),
				// 2. Имя продавца — обычный
				new TextRun({
					text: `${data.sellerName || '(ФИО ИП/организация)'}`,
					bold: false,
					size: 24,
					font: 'Times New Roman'
				}),

				new TextRun({
					text: `ИНН: ${data.sellerInn}, ОГРН: ${data.sellerOgrn}`,
					break: 1,
					size: 24
				}),
				new TextRun({
					text: `Куда: `,
					bold: true,
					break: 1,
					size: 24
				}),
				new TextRun({
					text: `${data.sellerLegalAddress}`,
					size: 24
				})
			],
			spacing: { after: 400 }
		})
	)

	// 2. Заголовок
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			children: [
				new TextRun({ text: 'Уведомление', bold: true, size: 32 }),
				new TextRun({
					text: '\nо выявлении факта реализации контрафактного товара',
					bold: true,
					size: 24,
					break: 1
				})
			],
			spacing: { after: 400 }
		})
	)

	// 3. Обращение и вводная часть
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: `Уважаемый ${data.sellerName},`,
					size: 24
				}),
				new TextRun({
					text: `Уведомляем Вас о том, что в ходе мониторинга рынка/контрольной закупки выявлен факт реализации товара с признаками контрафактности.`,
					break: 1,
					size: 24
				})
			],
			spacing: { line: 360, before: 200 }
		})
	)

	// 4. Сведения о выявленном факте
	children.push(
		new Paragraph({
			children: [
				new TextRun({
					text: 'Сведения о выявленном факте:',
					bold: true,
					size: 24
				})
			],
			spacing: { before: 200 }
		})
	)

	const facts = [
		`Торговая точка: ${data.shopName}.`,
		`Адрес торговой точки: ${data.shopLocation}, ${data.shopStreet}.`,
		`Дата выявления/приобретения товара: ${formatDate(data.purchaseDate)}.`, // Не забывай про формат даты
		`Признаки контрафактности: ${data.trademark}.`,
		`Правообладатель: ${data.rightHolder}.` // Исправил опечатку HoЫlder
	]

	facts.forEach(fact => {
		children.push(
			new Paragraph({
				spacing: { before: 100 },
				children: [
					new TextRun({
						text: fact,
						size: 24, // 24 полупункта = 12 кегль
						font: 'Times New Roman' // Чтобы точно по ГОСТу
					})
				]
			})
		)
	})

	// 5. Правовое обоснование
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'Реализация указанного товара нарушает исключительные права правообладателя и противоречит законодательству Российской Федерации, в том числе:',
					break: 1,
					size: 24
				})
			],
			spacing: { before: 200 }
		})
	)

	const laws = [
		'ст. 1484 ГК РФ (исключительное право на товарный знак);',
		'ст. 1515 ГК РФ (ответственность за незаконное использование товарного знака);',
		'ст. 1252 ГК РФ (защита исключительных прав);',
		'ст. 1229 ГК РФ (содержание исключительного права);',
		'ст. 14.10 КоАП РФ (незаконное использование средств индивидуализации);',
		'ст. 180 УК РФ (незаконное использование средств индивидуализации — при наличии признаков состава преступления).'
	]

	laws.forEach(law => {
		children.push(
			new Paragraph({
				alignment: AlignmentType.JUSTIFY,
				// Настройка отступов: тире слева, текст ровным блоком
				indent: { left: 360, hanging: 360 },
				tabStops: [{ type: TabStopType.LEFT, position: 360 }],
				spacing: { before: 80 },
				children: [
					new TextRun({
						text: `—\t${law}`,
						size: 24, // 12 кегль
						font: 'Times New Roman'
					})
				]
			})
		)
	})

	// 6. Требования
	children.push(
		new Paragraph({
			alignment: HorizontalPositionAlign.CENTER,
			children: [
				new TextRun({ text: '\nТРЕБУЕМ:', bold: true, break: 1, size: 32 })
			],
			spacing: { before: 200 }
		})
	)

	const requirements = [
		'Немедленно прекратить реализацию товара с признаками контрафактности.',
		'Изъять из оборота и удалить с витрин/склада/интернет-площадок весь товар, нарушающий права.',
		'Предоставить письменные пояснения о поставщике товара и копии подтверждающих документов.',
		'Сообщить о количестве реализованного и находящегося в остатке товара.',
		`Оплатить сумму компенсации/досудебного урегулирования в размере: ${data.compensationAmount} / ${data.preTrialCompensation} руб.  также возможно посредством перевода по QR-коду, предоставленному правообладателем (его представителем). Оплата по QR-коду признается надлежащим исполнением денежного обязательства при условии поступления средств в полном объеме.`
	]

	requirements.forEach((req, index) => {
		children.push(
			new Paragraph({
				alignment: AlignmentType.JUSTIFY, // Выравнивание по ширине
				spacing: { before: 120, after: 120 }, // Чуть больше отступа для читаемости
				children: [
					new TextRun({
						text: `${index + 1}. ${req}`,
						size: 24, // 12 кегль (24 полупункта)
						font: 'Times New Roman'
					})
				]
			})
		)
	})

	// Вставка QR-кода
	try {
		const qrPath = path.join(
			__dirname,
			'..',
			'assets',
			'images',
			'static-qr.png'
		)
		if (fs.existsSync(qrPath)) {
			children.push(
				new Paragraph({
					alignment: AlignmentType.LEFT,
					children: [
						new ImageRun({
							data: fs.readFileSync(qrPath),
							transformation: { width: 100, height: 100 },
							type: 'png'
						})
					],
					spacing: { before: 200, after: 200 }
				})
			)
		}
	} catch (e) {
		console.error('Ошибка вставки QR-кода:', e)
	}

	// 8. Заключительная часть
	children.push(
		new Paragraph({
			alignment: AlignmentType.JUSTIFY,
			children: [
				new TextRun({
					text: 'В случае неисполнения указанных требований в установленный срок мы будем вынуждены обратиться в суд, а также в правоохранительные и контролирующие органы для привлечения виновных лиц к ответственности, включая взыскание компенсации, судебных расходов и иных убытков.',
					size: 24
				})
			],
			spacing: { before: 200 }
		})
	)

	// 9. Подпись
	children.push(
		new Paragraph({
			alignment: AlignmentType.LEFT,
			children: [
				new TextRun({ text: 'С уважением,', break: 1, size: 24 }),
				new TextRun({ text: 'ООО «ЮК ШИП»', break: 1, size: 24 })
			],
			spacing: { before: 100 }
		})
	)

	return children
}

module.exports = notificationTemplate
