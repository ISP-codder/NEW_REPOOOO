const {
    Paragraph,
    TextRun,
    AlignmentType,
    ImageRun,
    PageBreak
} = require('docx')
const fs = require('fs')
const path = require('path')
const { processImage } = require('../utils/imageProcessor')

async function claimTemplate(data, photos) {
    const children = []

    const baseTextStyle = { size: 24 }

    const formatDate = dateStr => {
        if (!dateStr) return ''
        const [year, month, day] = dateStr.split('-')
        return `${day}.${month}.${year}`
    }

    // Блок получателя
    children.push(
        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({
                    ...baseTextStyle,
                    text: `Кому: `,
                    bold: true
                }),
                new TextRun({
                    ...baseTextStyle,
                    text: `${data.sellerName}`,
                    bold: false
                }),
                new TextRun({
                    ...baseTextStyle,
                    text: `ИНН: ${data.sellerInn}, ОГРН: ${data.sellerOgrn}`,
                    break: 1
                }),
                new TextRun({
                    ...baseTextStyle,
                    text: `Куда: `,
                    bold: true,
                    break: 1
                }),
                new TextRun({
                    ...baseTextStyle,
                    text: `${data.sellerLegalAddress}`,
                    bold: false
                })
            ],
            spacing: { before: 0, after: 200 }
        })
    )

    // Заголовок
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: 'Досудебная претензия', bold: true, size: 28 }),
                new TextRun({
                    text: '\nо нарушении исключительных прав на товарный знак',
                    bold: true,
                    size: 28,
                    break: 1
                })
            ],
            spacing: { before: 200, after: 200 }
        })
    )

    // Основной текст (Добавлен отступ 1.25)
    children.push(
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    ...baseTextStyle,
                    text: `Уважаемый ${data.sellerName},`
                }),
                new TextRun({
                    ...baseTextStyle,
                    text: `Настоящей претензией заявляем о факте нарушения исключительных прав правообладателя на товарный знак ${data.trademark}`,
                    break: 1
                }),
                new TextRun({
                    ...baseTextStyle,
                    text: `В ходе закупки ${formatDate(data.purchaseDate)} по адресу: ${data.shopLocation}, ${data.shopStreet} в торговой точке "${data.shopName}" зафиксирована продажа товара: категория ${data.productCategory}, название - ${data.productCategoryName}, в количестве ${data.productQuantity}, стоимостью ${data.productPrice} рублей маркированного обозначением, используемым без законных оснований. Доказательства нарушения имеются у правообладателя ${data.plaintiffName}.`,
                    break: 1
                })
            ],
            spacing: { after: 200, before: 200 }
        })
    )

    // Правовая квалификация (Добавлен отступ 1.25)
    children.push(
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    ...baseTextStyle,
                    text: 'Правовая квалификация нарушения: ст. 1484 и ст. 1515 ГК РФ, в системной связи со ст. 1229 и ст. 1252 ГК РФ; также применима ст. 14.10 КоАП РФ.'
                })
            ],
            spacing: { after: 100 }
        })
    )

    // В целях урегулирования (Добавлен отступ 1.25)
    children.push(
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    ...baseTextStyle,
                    text: 'На основании вышеизложенного, в целях досудебного урегулирования настоящего спора,'
                })
            ],
            spacing: { after: 100 }
        })
    )

    // Требуем
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Требуем:', bold: true, size: 28 })],
            spacing: { before: 240, after: 240 }
        })
    )

    const requirements = [
        'Прекратить использование обозначения, сходного до степени смешения с товарным знаком правообладателя.',
        'Изъять контрафактный товар из оборота и исключить его повторное поступление в продажу.',
        `Выплатить компенсацию в размере ${data.compensationAmount || 'не указана'} руб.`,
        'Сообщить данные поставщика и представить подтверждающие документы происхождения товара.',
        'Направить мотивированный письменный ответ.'
    ]

    requirements.forEach((req, index) => {
        children.push(
            new Paragraph({
                indent: { firstLine: 708 },
                children: [
                    new TextRun({ ...baseTextStyle, text: `${index + 1}. ${req}` })
                ],
                spacing: { before: 100 }
            })
        )
    })

    // Про оплату (Добавлен отступ 1.25)
    children.push(
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    ...baseTextStyle,
                    text: 'Оплату компенсации можно произвести банковским переводом либо по QR-коду, приложенному к претензии.'
                })
            ]
        })
    )

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
                    alignment: AlignmentType.CENTER,
                    children: [
                        new ImageRun({
                            data: fs.readFileSync(qrPath),
                            transformation: { width: 50, height: 50 },
                            type: 'png'
                        })
                    ],
                    spacing: { before: 100, after: 100 }
                })
            )
        }
    } catch (e) {
        console.error(e)
    }

    // Контакты (Добавлен отступ 1.25)
    children.push(
        new Paragraph({
            spacing: { after: 100 },
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    text: 'По вопросам, связанным с настоящим уведомлением, Вы можете связаться с нами по следующим контактным данным:',
                    size: 24,
                    font: 'Times New Roman'
                })
            ]
        }),
        new Paragraph({
            spacing: { before: 100 },
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    text: 'E-mail: uk.ship.999@yandex.ru',
                    size: 24,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: 'Телефон: +7 989 517-54-87',
                    break: 1,
                    size: 24,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: 'WhatsApp: +7 989 517-54-87',
                    break: 1,
                    size: 24,
                    font: 'Times New Roman'
                })
            ]
        })
    )

    // Рекомендация WhatsApp (Добавлен отступ 1.25)
    children.push(
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { before: 200 },
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    text: 'Для связи через WhatsApp рекомендуем предварительно сохранить указанный номер в телефонной книжке вашего устройства.',
                    size: 24,
                    font: 'Times New Roman'
                })
            ]
        })
    )

    // Последствие (Добавлен отступ 1.25)
    children.push(
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    ...baseTextStyle,
                    text: 'При неисполнении требований правообладатель обратится в суд за взысканием компенсации, судебных расходов и применением мер пресечения нарушения.'
                })
            ],
            spacing: { before: 200 }
        })
    )

    // Приложения (Добавлен отступ 1.25)
    children.push(
        new Paragraph({
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    ...baseTextStyle,
                    text: '\nПриложения:',
                    bold: true,
                    break: 1
                }),
                new TextRun({
                    ...baseTextStyle,
                    text: '\n1. Доказательства нарушения (чек, фото),',
                    break: 1
                }),
                new TextRun({
                    ...baseTextStyle,
                    text: '\n2. Копия Доверенности.',
                    break: 1
                })
            ]
        })
    )

    // Подпись
    children.push(
        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({ ...baseTextStyle, text: '\nС уважением,', break: 1 }),
                new TextRun({
                    ...baseTextStyle,
                    text: '\nООО «ЮК ШИП»',
                    break: 1
                })
            ],
            spacing: { before: 100 }
        })
    )

    // Блок подписи и печати (Без изменений)
    try {
        const signaturePath = path.join(__dirname, '..', 'assets', 'images', 'signature.png')
        const printPath = path.join(__dirname, '..', 'assets', 'images', 'print.png')
        const signatureExists = fs.existsSync(signaturePath)
        const printExists = fs.existsSync(printPath)

        if (signatureExists || printExists) {
            children.push(
                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    spacing: { before: 200, after: 200 },
                    children: [
                        ...(signatureExists ? [new ImageRun({ data: fs.readFileSync(signaturePath), transformation: { width: 100, height: 100 }, type: 'png' })] : []),
                        ...(printExists ? [new ImageRun({ data: fs.readFileSync(printPath), transformation: { width: 150, height: 120 }, type: 'png' })] : [])
                    ]
                })
            )
        }
    } catch (e) {
        console.error('Ошибка при добавлении подписи/печати:', e)
    }

    // Фотографии
    for (const [title, buffer] of Object.entries(photos)) {
        if (buffer && buffer.length > 0) {
            const cleanImg = await processImage(buffer)
            if (cleanImg) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ ...baseTextStyle, text: title, bold: true })
                        ],
                        spacing: { before: 400, after: 100 },
                        alignment: AlignmentType.CENTER
                    })
                )
                children.push(
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: cleanImg,
                                transformation: { width: 450, height: 337 },
                                type: 'jpg'
                            })
                        ],
                        spacing: { after: 400 }
                    })
                )
            }
        }
    }

    return children
}

module.exports = claimTemplate