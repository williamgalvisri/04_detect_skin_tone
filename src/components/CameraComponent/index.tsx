import React, { useEffect, useState } from 'react';
import { IonButton, IonAlert, IonIcon } from '@ionic/react';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { Camera } from '@capacitor/camera';
import { flashOutline, swapVertical, flashOffOutline } from 'ionicons/icons';

interface CameraComponentProps {
	onCapture: (base64Image: string) => void;
	showMarker?: boolean;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, showMarker = false }) => {
	const [showAlert, setShowAlert] = useState(false);
	const [message, setMessage] = useState<string>('');
	const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
	const [cameraInitialized, setCameraInitialized] = useState(false);

	useEffect(() => {
		checkPermissions();
		return () => {
			stopCamera();
		};
	}, []);

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

	const startCamera = async () => {
		const cameraPreviewOptions: CameraPreviewOptions = {
			position: 'rear',
			parent: 'content',
			className: 'fullscreen',
			toBack: true,
		};
		try {
			await CameraPreview.start(cameraPreviewOptions);
			setCameraInitialized(true);
			const supportedFlashModes = await CameraPreview.getSupportedFlashModes();
			console.log('Supported flash modes:', supportedFlashModes);
		} catch (error) {
			showError(error, 'startCamera');
		}
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
			await CameraPreview.flip();
		} catch (error) {
			showError(error, 'swapCamera');
		}
	};

	const toggleFlash = async () => {
		if (!cameraInitialized) {
			showError('Camera not initialized', 'toggleFlash');
			return;
		}
		try {
			const newFlashMode = flashMode === 'off' ? 'on' : 'off';
			await CameraPreview.setFlashMode({ flashMode: newFlashMode });
			setFlashMode(newFlashMode);
			console.log('Flash mode set to:', newFlashMode);
		} catch (error) {
			showError(error, 'toggleFlash');
		}
	};

	return (
		<>
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
				<IonIcon icon={flashMode === 'off' ? flashOffOutline : flashOutline} size="large" />
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
				Capturar Foto
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