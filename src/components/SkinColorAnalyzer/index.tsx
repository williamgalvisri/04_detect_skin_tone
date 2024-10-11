import React, { useEffect, useRef, useState } from 'react';
import { IonButton } from '@ionic/react';
import ColorRecommendationsModal from '../ColorRecommendationsModal';

interface SkinColorAnalyzerProps {
    photo: string | null;
}

const SkinColorAnalyzer: React.FC<SkinColorAnalyzerProps> = ({ photo }) => {
    const [skinColor, setSkinColor] = useState<string | null>(null);
    const [recomendaciones, setRecomendaciones] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [tonoPiel, setTonoPiel] = useState('');
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {    
        extractSkinColor();
    }, [photo])

    const extractSkinColor = () => {
        if (!photo) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        const img = new Image();
        img.src = photo;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const centerX = img.width / 2;
            const centerY = img.height / 2;
            const radiusX = 200;
            const radiusY = 250;

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;

            let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;

            for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                    const dx = x - centerX;
                    const dy = y - centerY;

                    if ((dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1) {
                        const index = (y * img.width + x) * 4;
                        rTotal += data[index];
                        gTotal += data[index + 1];
                        bTotal += data[index + 2];
                        count++;
                    }
                }
            }

            const rAvg = Math.floor(rTotal / count);
            const gAvg = Math.floor(gTotal / count);
            const bAvg = Math.floor(bTotal / count);

            const tonoPiel = clasifyColors(rAvg, gAvg, bAvg);
            const recomendaciones = makeupRecommended(tonoPiel);

            setRecomendaciones(recomendaciones);
            setTonoPiel(tonoPiel);

            if (count > 0) {
                const avgColor = `RGB(${rAvg}, ${gAvg}, ${bAvg})`;
                setSkinColor(avgColor);
            }
        };
    };

    const clasifyColors = (r: number, g: number, b: number): 'claro' | 'medio claro' | 'medio' | 'oscuro' => {
        if (r > 200 && g > 170 && b > 150) {
            return 'claro';
        } else if (r > 150 && g > 130 && b > 110) {
            return 'medio claro';
        } else if (r > 100 && g > 90 && b > 80) {
            return 'medio';
        } else {
            return 'oscuro';
        }
    }

    const makeupRecommended = (tonoPiel: string) => {
        switch (tonoPiel) {
			case 'claro':
				return {
					labial: ['Rosa suave: #FFC0CB', 'Coral: #F88379', 'Nude: #E3BEB5'],
					base: ['Beige claro: #F5E2D4', 'Marfil: #FAF0E6'],
					sombra: ['Pastel: #FFDAB9', 'Beige: #F5F5DC', 'Dorado suave: #FFD700']
				};
			case 'medio claro':
				return {
					labial: ['Rosa intenso: #FF69B4', 'Nude cálido: #D8B6A4', 'Melocotón: #FFA07A'],
					base: ['Beige medio: #E3C4A8', 'Arena: #F4DECB'],
					sombra: ['Bronce: #CD7F32', 'Marrón suave: #D2B48C', 'Neutro: #8B4513']
				};
			case 'medio':
				return {
					labial: ['Rojo: #ff0000', 'Malva: #993366', 'Tierra: #8B4513'],
					base: ['Beige oscuro: #D2B48C', 'Dorado: #FFD700'],
					sombra: ['Dorado: #FFD700', 'Cobre: #B87333', 'Ciruela: #7D0552']
				};
			case 'oscuro':
				return {
					labial: ['Borgoña: #800020', 'Morado oscuro: #4B0082', 'Marrón: #654321'],
					base: ['Café oscuro: #4B3A2A', 'Ébano: #3D0C02'],
					sombra: ['Bronce: #CD7F32', 'Dorado: #DAA520', 'Verde oscuro: #006400', 'Azul profundo: #000080']
				};
			default:
				return null;
		}
    }

    return (
        <>
            {skinColor && (
                <div style={{
                    position: 'absolute',
                    top: 110,
                    left: 10,
                    width: '100px',
                    height: '100px',
                    backgroundColor: skinColor,
                    marginTop: '20px'
                }} onClick={() => setShowModal(true)} />
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <ColorRecommendationsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                tonoPiel={tonoPiel}
                recomendaciones={recomendaciones}
            />
        </>
    );
};

export default SkinColorAnalyzer;