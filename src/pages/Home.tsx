import React, { useEffect, useRef, useState } from 'react';
import { IonContent, IonPage, IonButton, IonAlert } from '@ionic/react';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { Camera } from '@capacitor/camera';
import './Home.css';
import ColorRecommendationsModal from '../components/ColorRecommendationsModal';

const Home: React.FC = () => {
	const [photo, setPhoto] = useState<string | null>(null);
	const [showAlert, setShowAlert] = useState(false);
	const [message, setMessage] = useState<string>('');
	const [skinColor, setSkinColor] = useState<string | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [recomendaciones, setRecomendaciones] = useState<any>(null);
	const [showModal, setShowModal] = useState(false);
	const [tonoPiel, setTonoPiel] = useState('')

	useEffect(() => {
		checkPermissions();

		return () => {
			stopCamera();
		};
	}, []);

	const checkPermissions = async () => {
		try {
			console.log('Verificando permisos de cámara...');
			const permission = await Camera.checkPermissions();
			console.log('Estado de permisos:', permission);
			if (permission.camera !== 'granted') {
				console.log('Solicitando permisos de cámara...');
				const request = await Camera.requestPermissions();
				console.log('Resultado de la solicitud de permisos:', request);
				if (request.camera === 'granted') {
					startCamera();
				} else {
					setMessage('Permiso de cámara denegado');
					setShowAlert(true);
				}
			} else {
				startCamera();
			}
		} catch (error) {
			console.error('Error al verificar/solicitar permisos:', error);
			setMessage('Error al verificar permisos: ' + JSON.stringify(error));
			setShowAlert(true);
		}
	};

	const startCamera = async () => {
		const cameraPreviewOptions: CameraPreviewOptions = {
			position: 'front',
			parent: 'content',
			className: 'fullscreen',
			toBack: true,
		};
		try {
			console.log('Iniciando cámara...');
			CameraPreview.start(cameraPreviewOptions);
			console.log('Cámara iniciada con éxito');
		} catch (error) {
			console.error('Error al iniciar la cámara:', error);
			setMessage('Error al iniciar la cámara: ' + JSON.stringify(error));
			setShowAlert(true);
		}
	};

	const stopCamera = async () => {
		try {
			console.log('Deteniendo cámara...');
			await CameraPreview.stop();
			console.log('Cámara detenida con éxito');
		} catch (error) {
			console.error('Error al detener la cámara:', error);
		}
	};

	const capturePhoto = async () => {
		try {
			console.log('Capturando foto...');
			const result = await CameraPreview.capture({
				quality: 100
			});
			console.log('Foto capturada:', result);
			const base64Image = `data:image/jpeg;base64,${result.value}`;
			setPhoto(base64Image);
			extractSkinColor(base64Image);

		} catch (error) {
			console.error('Error al capturar foto:', error);
			setMessage('Error al capturar foto: ' + JSON.stringify(error));
			setShowAlert(true);
		}
	};

	const extractSkinColor = (base64Image: string) => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;

		const img = new Image();
		img.src = base64Image;

		img.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

			// Establece el tamaño del canvas igual al tamaño de la imagen capturada
			canvas.width = img.width;
			canvas.height = img.height;

			// Dibuja la imagen en el canvas
			ctx.drawImage(img, 0, 0, img.width, img.height);

			// Coordenadas del centro y radios de la elipse
			const centerX = img.width / 2;
			const centerY = img.height / 2;
			const radiusX = 200;  // Radio horizontal (mitad de 400)
			const radiusY = 250;  // Radio vertical (mitad de 500)

			// Obtiene todos los píxeles de la imagen
			const imageData = ctx.getImageData(0, 0, img.width, img.height);
			const data = imageData.data;

			let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;

			// Recorre todos los píxeles para verificar si están dentro de la elipse
			for (let y = 0; y < img.height; y++) {
				for (let x = 0; x < img.width; x++) {
					// Coordenadas relativas al centro de la elipse
					const dx = x - centerX;
					const dy = y - centerY;

					// Verifica si el punto (x, y) está dentro de la elipse
					if ((dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1) {
						const index = (y * img.width + x) * 4;
						rTotal += data[index];     // Rojo
						gTotal += data[index + 1]; // Verde
						bTotal += data[index + 2]; // Azul
						count++;
					}
				}
			}

			// Calcula el promedio del color
			const rAvg = Math.floor(rTotal / count);
			const gAvg = Math.floor(gTotal / count);
			const bAvg = Math.floor(bTotal / count);

			const tonoPiel = clasifyColors(rAvg, gAvg, bAvg);
			const recomendaciones = makeupRecommended(tonoPiel);

			setRecomendaciones(recomendaciones);
			setShowModal(true);
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
		<IonPage>
			<IonContent fullscreen id="content">
				{/* Contenedor para la cámara */}

				<div style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: '300px',
					height: '400px',
					zIndex: 2,
					pointerEvents: 'none',  // Asegura que los eventos de clic no interfieran
				}}>
					<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
						<ellipse cx="150" cy="200" rx="150" ry="200" fill="none" stroke={'white'} strokeWidth="4" />
					</svg>
				</div>

				{photo && (
					<img
						src={photo}
						style={{
							position: 'absolute',
							top: 10,
							left: 10,
							width: 100,
							height: 100,
							objectFit: 'cover',
							zIndex: 999
						}}
					/>
				)}
				{/* Mostrar el color de piel estimado */}
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
				<IonButton
					onClick={capturePhoto}
					style={{
						position: 'absolute',
						bottom: 20,
						left: '50%',
						transform: 'translateX(-50%)',
						zIndex: 999
					}}
				>
					Capturar Foto
				</IonButton>
				<ColorRecommendationsModal
					isOpen={showModal}
					onClose={() => setShowModal(false)}
					tonoPiel={tonoPiel}
					recomendaciones={recomendaciones}
				/>
				<IonAlert
					isOpen={showAlert}
					onDidDismiss={() => setShowAlert(false)}
					header="Message"
					message={message}
					buttons={['OK']}
				/>
			</IonContent>
		</IonPage>
	);
};

export default Home;

