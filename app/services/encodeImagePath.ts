// utils/encodeImagePath.js
export const encodeImagePath = (imagePath: string): string => {
    // Проверяем, начинается ли путь с http:// или https://
    if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
        // Энкодим только имя файла, оставляя части пути нетронутыми
        const parts = imagePath.split('/');
        const fileName = parts.pop();
        if (fileName) {
            const encodedFileName = encodeURIComponent(fileName);
            // Возвращаем собранный путь с закодированным именем файла
            return `${parts.join('/')}/${encodedFileName}`;
        } else {
            // Если имя файла не найдено, возвращаем исходный путь
            return imagePath;
        }
    }
    return imagePath;
};