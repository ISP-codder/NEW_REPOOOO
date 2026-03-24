const sharp = require('sharp')

/**
 * Приводит любое изображение к стандартному JPEG с фиксированным качеством
 * @param {Buffer} buffer - Исходный буфер файла
 * @returns {Promise<Buffer|null>} - Очищенный буфер
 */
async function processImage(buffer) {
	if (!buffer || buffer.length === 0) return null
	try {
		return await sharp(buffer)
			.jpeg({ quality: 80, chromaSubsampling: '4:4:4' })
			.toBuffer()
	} catch (err) {
		console.error('Ошибка Sharp при обработке:', err)
		return null
	}
}

module.exports = { processImage }
