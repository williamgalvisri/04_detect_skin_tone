export const extractSkinColor = (base64Image) => {
    const img = new Image();
    img.src = base64Image;

    img.onload = () => {
        // Crear un canvas para dibujar la imagen
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Obtener los píxeles de la región de interés (por ejemplo, el centro de la imagen)
        const width = canvas.width;
        const height = canvas.height;

        // Elegir un área en el centro de la imagen (modificar según sea necesario)
        const regionSize = 50; // Tamaño de la región a analizar
        const xStart = Math.floor(width / 2 - regionSize / 2);
        const yStart = Math.floor(height / 2 - regionSize / 2);

        const imageData = ctx.getImageData(
            xStart,
            yStart,
            regionSize,
            regionSize
        );
        const pixels = imageData.data; // Array con valores RGBA

        // Calcular el promedio de los valores RGB
        let r = 0,
            g = 0,
            b = 0;
        let count = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            r += pixels[i]; // Valor R
            g += pixels[i + 1]; // Valor G
            b += pixels[i + 2]; // Valor B
            count++;
        }

        // Promedio de cada canal de color
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Mostrar el color promedio calculado
        console.log(`Color promedio: rgb(${r}, ${g}, ${b})`);
        setSkinColor(`rgb(${r}, ${g}, ${b})`); // Almacenar el color promedio
    };
};
