import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonAlert, IonIcon, getPlatforms } from '@ionic/react';
import { CameraPreview, CameraPreviewOptions } from '@capgo/camera-preview';
import { Camera } from '@capacitor/camera';
import { flashOutline, swapVertical, flashOffOutline } from 'ionicons/icons';
import { CapacitorFlash } from '@capgo/capacitor-flash';
import { ScreenBrightness } from '@capacitor-community/screen-brightness';
interface CameraComponentProps {
	onCapture: (base64Image: string) => void;
	showMarker?: boolean;
}


const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, showMarker = false }) => {
	const [showAlert, setShowAlert] = useState(false);
	const [message, setMessage] = useState<string>('');
	const [isFlashOn, setIsFlashOn] = useState<boolean>(false);
	const [cameraInitialized, setCameraInitialized] = useState(false);
	const [cameraPosition, setCameraPosition] = useState<'rear' | 'front'>('rear');
	const [isSimulatedFlashOn, setIsSimulatedFlashOn] = useState<boolean>(false);
	const flashOverlayRef = useRef<HTMLDivElement>(null);
	const [originalBrightness, setOriginalBrightness] = useState<number>(0);


	useEffect(() => {
		checkPermissions();
		getCurrentBrightness();
		return () => {
			stopCamera();
			restoreBrightness();
		};

	}, []);

	const getCurrentBrightness = async () => {
		try {
			const { brightness: currentBrightness } = await ScreenBrightness.getBrightness();
			setOriginalBrightness(currentBrightness);
		} catch (error) {
			console.error('Error getting brightness:', error);
		}
	};

	const restoreBrightness = async () => {
		try {
			await setBrightness(originalBrightness);
		} catch (error) {
			console.error('Error restoring brightness:', error);
		}
	};

	const setBrightness = async (value: number) => {
		try {
			await ScreenBrightness.setBrightness({ brightness: value });
		} catch (error) {
			console.error('Error setting brightness:', error);
		}
	};


	const simulateFrontFlash = async () => {
		if (flashOverlayRef.current) {
			await getCurrentBrightness();
			await setBrightness(1);
			flashOverlayRef.current.style.opacity = '1';
			setTimeout(() => {
				if (flashOverlayRef.current) {
					flashOverlayRef.current.style.opacity = '0';
				}
				setTimeout(() => restoreBrightness(), 1000);
			}, 500); // Duración del flash simulado
		}
	};

	const showError = (error: any, context: string) => {
		console.error(`Error in ${context}:`, error);
		setMessage(`Error in ${context}: ${JSON.stringify(error)}`);
		setShowAlert(true);
	};

	const checkPermissions = async () => {
		try {
			const permission = await Camera.checkPermissions();
			if (permission.camera !== 'granted') {
				const request = await Camera.requestPermissions();
				if (request.camera === 'granted') {
					await startCamera();
				} else {
					showError('Permiso de cámara denegado', 'checkPermissions');
				}
			} else {
				await startCamera();
			}
		} catch (error) {
			showError(error, 'checkPermissions');
		}
	};

	const startCamera = () => {
		setTimeout(async () => {
			const cameraPreviewOptions: CameraPreviewOptions = {
				position: cameraPosition,
				parent: 'content',
				className: 'fullscreen',
				toBack: true,
				enableHighResolution: true,
				storeToFile: false
			};
			try {
				await CameraPreview.start(cameraPreviewOptions);
				setCameraInitialized(true);
			} catch (error) {
				showError(error, 'startCamera');
			}
		}, 1000);
	};

	const stopCamera = async () => {
		if (cameraInitialized) {
			try {
				await CameraPreview.stop();
				setCameraInitialized(false);
			} catch (error) {
				showError(error, 'stopCamera');
			}
		}
	};

	const capturePhoto = async () => {
		if (!cameraInitialized) {
			showError('Camera not initialized', 'capturePhoto');
			return;
		}
		try {
			if (cameraPosition === 'front' && isSimulatedFlashOn) {
				await simulateFrontFlash();
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			const result = await CameraPreview.capture({
				quality: 100
			});
			const base64Image = `data:image/jpeg;base64,${result.value}`;
			onCapture(base64Image);
		} catch (error) {
			showError(error, 'capturePhoto');
		}
	};

	const swapCamera = async () => {
		if (!cameraInitialized) {
			showError('Camera not initialized', 'swapCamera');
			return;
		}
		try {
			await turnOffFlash();
			await CameraPreview.flip();

			setCameraPosition(prev => prev === 'rear' ? 'front' : 'rear');
		} catch (error) {
			showError(error, 'swapCamera');
		}
	};

	const toggleFlash = async () => {
		if (cameraPosition === 'front') {
			setIsSimulatedFlashOn(!isSimulatedFlashOn);
			return;
		}

		try {
			if (!isFlashOn) {
				await CameraPreview.setFlashMode({ flashMode: 'torch' });
				await CapacitorFlash.switchOn({ intensity: 100 });
			} else {
				await turnOffFlash();
			}
			setIsFlashOn(!isFlashOn);
		} catch (error) {
			console.error('Error toggling flash:', error);
			showError(error, 'toggleFlash');
		}
	};

	const turnOffFlash = async () => {
		try {
			if (cameraPosition === 'front') {
				setIsSimulatedFlashOn(false);
				setIsFlashOn(false);
				return;
			}
			await CameraPreview.setFlashMode({ flashMode: 'off' });
			await CapacitorFlash.switchOff();
			setIsFlashOn(false);
		} catch (error) {
			console.error('Error turning off flash:', error);
			showError(error, 'turnOffFlash');
		}
	};

	return (
		<>
			<div
				ref={flashOverlayRef}
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: 'white',
					opacity: 0,
					transition: 'opacity 0.1s ease-out',
					pointerEvents: 'none',
					zIndex: 1000,
				}}
			/>
			{showMarker && (
				<div style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: '300px',
					height: '400px',
					zIndex: 2,
					pointerEvents: 'none',
				}}>
					<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
						<ellipse cx="150" cy="200" rx="150" ry="200" fill="none" stroke={'white'} strokeWidth="4" />
					</svg>
				</div>
			)}
			<div
				style={{
					position: 'absolute',
					right: 0,
					padding: '24px',
					top: 54,
					zIndex: 999,
					backgroundColor: 'transparent',
					color: 'white',
					border: 'none',
					outline: 'none',
					cursor: 'pointer',
				}}
				onClick={swapCamera}
			>
				<IonIcon icon={swapVertical} size="large" />
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					padding: '24px',
					top: 54,
					zIndex: 999,
					backgroundColor: 'transparent',
					color: 'white',
					border: 'none',
					outline: 'none',
					cursor: 'pointer',
				}}
				onClick={toggleFlash}
			>
				<IonIcon icon={
					cameraPosition === 'front'
						? (isSimulatedFlashOn ? flashOutline : flashOffOutline)
						: (isFlashOn ? flashOutline : flashOffOutline)
				} size="large" />
			</div>
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
				Capturar Foto {cameraPosition}
			</IonButton>
			<IonAlert
				isOpen={showAlert}
				onDidDismiss={() => setShowAlert(false)}
				header="Error"
				message={message}
				buttons={['OK']}
			/>
		</>
	);
};

export default CameraComponent;