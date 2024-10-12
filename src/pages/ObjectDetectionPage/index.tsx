import React, { useState } from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';
import CameraComponent from '../../components/CameraComponent';
import { PreviewImageModal } from '../../components/PreviewImageModal';

const ObjectDetectionPage: React.FC = () => {
    const [photo, setPhoto] = useState<string | null>(null);
    const [showPreviewImage, setShowPreviewImage] = useState(false);

    const handleCapture = (base64Image: string) => {
        setPhoto(base64Image);
        setShowPreviewImage(true);
        // Aquí implementarías la lógica de detección de objetos
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>Detección de Objetos</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen id='content'>
                <CameraComponent onCapture={handleCapture} />
                <PreviewImageModal isOpen={showPreviewImage} onClose={() => setShowPreviewImage(false)} photo={photo} />
            </IonContent>
        </IonPage>
    );
};

export default ObjectDetectionPage;