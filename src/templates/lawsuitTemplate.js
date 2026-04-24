const { Paragraph, TextRun, AlignmentType, ImageRun } = require('docx')
const fs = require('fs')
const path = require('path')

async function lawsuitTemplate(data, photos) {
    const children = []

    const formatDate = dateStr => {
        if (!dateStr) return '«___» __________ 202___ г.'
        const [year, month, day] = dateStr.split('-')
        return `${day}.${month}.${year}`
    }

    const SIZE_12 = 24 // В docx 24 = 12pt
    const SIZE_14 = 28 

    const bodyStyle = {
        alignment: AlignmentType.JUSTIFY,
        spacing: { before: 120, after: 120 },
        indent: { firstLine: 708 } // Отступ 1.25 см
    }

    // Шапка документа (без отступа первой строки)
    children.push(
        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({
                    text: data.courtName,
                    bold: true,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: 'Адрес суда: ',
                    bold: true,
                    break: 1,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: data.courtAddress,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),

                new TextRun({
                    text: `Истец: `,
                    bold: true,
                    break: 2,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: data.plaintiffName,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),

                new TextRun({
                    text: `Представитель истца: `,
                    bold: true,
                    break: 1,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: data.representativeName,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),

                new TextRun({
                    text: `Ответчик: `,
                    bold: true,
                    break: 2,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: data.sellerName,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: `ИНН: ${data.sellerInn}, ОГРН: ${data.sellerOgrn}`,
                    break: 1,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),

                new TextRun({
                    text: `Юридический адрес: `,
                    bold: true,
                    break: 1,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: data.sellerLegalAddress,
                    size: SIZE_12,
                    font: 'Times New Roman'
                })
            ]
        })
    )

    // Заголовок
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 200 },
            children: [
                new TextRun({
                    text: 'Исковое заявление',
                    bold: true,
                    size: SIZE_14,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: 'о пресечении незаконного использования товарного знака',
                    bold: true,
                    break: 1,
                    size: SIZE_14,
                    font: 'Times New Roman'
                })
            ]
        })
    )

    // Основной текст
    const productInfo = data.productCategoryName
        ? `${data.productCategory} (${data.productCategoryName})`
        : data.productCategory

    const texts = [
        `Истец является правообладателем товарного знака №${data.tmNumbers}.`,
        `Из материалов дела следует, что ${formatDate(data.purchaseDate)} в торговой точке Ответчика ${data.shopName}, по адресу: ${data.shopLocation}, ${data.shopStreet}) реализовывался товар: категория - ${data.productCategory}, название - ${data.productCategoryName} в количестве ${data.productCount} шт., стоимостью ${data.productPrice} рублей с признаками контрафактности. Использование спорного обозначения осуществлялось без разрешения Истца, чем нарушено исключительное право правообладателя.`,
        `Нарушение подтверждается документами и видеофиксацией, прилагаемыми к иску. Ранее Истец направлял досудебную претензию, однако требования добровольно не исполнены.`
    ]

    texts.forEach(t => {
        children.push(
            new Paragraph({
                ...bodyStyle,
                children: [
                    new TextRun({ text: t, size: SIZE_12, font: 'Times New Roman' })
                ]
            })
        )
    })

    children.push(
        new Paragraph({
            ...bodyStyle,
            children: [
                new TextRun({
                    text: 'С учетом ст. 1229, 1252, 1484, 1515 ГК РФ, а также процессуальных норм ст. 131-132 ГПК РФ (или ст. 125-126 АПК РФ),',
                    italic: true,
                    size: SIZE_12,
                    font: 'Times New Roman'
                })
            ]
        })
    )

    // Требования
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: 'Требуем:',
                    bold: true,
                    size: SIZE_14,
                    font: 'Times New Roman'
                })
            ],
            spacing: { before: 200, after: 200 }
        })
    )

    const requests = [
        'Признать действия Ответчика нарушающими исключительные права Истца на товарный знак.',
        'Обязать Ответчика прекратить незаконное использование обозначения.',
        'Изъять из оборота и уничтожить контрафактный товар, а также предъявить доказательство уничтожения товара.',
        `Взыскать компенсацию в сумме ${data.compensationAmount || '( )'} руб.`,
        'Взыскать судебные расходы, включая госпошлину и расходы на представителя.'
    ]

    requests.forEach((text, index) => {
        children.push(
            new Paragraph({
                alignment: AlignmentType.JUSTIFY,
                indent: { left: 500, hanging: 500 },
                children: [
                    new TextRun({
                        text: `${index + 1}.`,
                        size: SIZE_12,
                        font: 'Times New Roman'
                    }),
                    new TextRun({
                        text: `\t${text}`,
                        size: SIZE_12,
                        font: 'Times New Roman'
                    })
                ]
            })
        )
    })

    // Контакты
    children.push(
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { before: 200 },
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    text: 'По вопросам, связанным с настоящим уведомлением, Вы можете связаться с нами по следующим контактным данным:',
                    size: SIZE_12,
                    font: 'Times New Roman'
                })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 120, after: 120 },
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    text: 'E-mail: ',
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: 'uk.ship.999@yandex.ru',
                    size: SIZE_12,
                    font: 'Times New Roman',
                    color: '0563C1',
                    underline: {}
                }),
                new TextRun({
                    text: 'Телефон: +7 989 517-54-87',
                    break: 1,
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: 'WhatsApp: +7 989 517-54-87',
                    break: 1,
                    size: SIZE_12,
                    font: 'Times New Roman'
                })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { before: 120, after: 120 },
            indent: { firstLine: 708 },
            children: [
                new TextRun({
                    text: 'Истец предпринимал меры досудебного урегулирования, включая предложение добровольной оплаты (в том числе с использованием QR-кода), что подтверждает добросовестность поведения Истца.',
                    size: SIZE_12,
                    font: 'Times New Roman'
                })
            ]
        })
    )

    // ПОДПИСЬ
    children.push(
        new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({
                    text: 'С уважением,',
                    size: SIZE_12,
                    font: 'Times New Roman'
                }),
                new TextRun({
                    text: 'ООО «ЮК ШИП»',
                    break: 1,
                    size: SIZE_12,
                    font: 'Times New Roman'
                })
            ]
        })
    )
    
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
                        ...(signatureExists
                            ? [
                                    new ImageRun({
                                        data: fs.readFileSync(signaturePath),
                                        transformation: { width: 100, height: 100 },
                                        type: 'png'
                                    })
                                ]
                            : []),
                        ...(printExists
                            ? [
                                    new ImageRun({
                                        data: fs.readFileSync(printPath),
                                        transformation: { width: 150, height: 120 },
                                        type: 'png'
                                    })
                                ]
                            : [])
                    ]
                })
            )
        }
    } catch (e) {
        console.error('Ошибка при добавлении подписи/печати:', e)
    }
    return children
}

module.exports = lawsuitTemplate