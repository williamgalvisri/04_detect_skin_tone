import React, { useState } from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';
import SkinColorAnalyzer from '../../components/SkinColorAnalyzer';
import CameraComponent from '../../components/CameraComponent';


const SkinColorAnalysisPage: React.FC = () => {
    const [photo, setPhoto] = useState<string | null>(null);

    const handleCapture = (base64Image: string) => {
        setPhoto(base64Image);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>Análisis de Color de Piel</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen id='content'>
                <CameraComponent showMarker onCapture={handleCapture} />
                {photo && (
                    <>
                        <img
                            src={photo}
                            style={{
                                position: 'absolute',
                                top: 60,
                                left: 10,
                                width: 100,
                                height: 100,
                                objectFit: 'cover',
                                zIndex: 999
                            }}
                        />
                        <SkinColorAnalyzer photo={photo} />
                    </>
                )}
            </IonContent>
        </IonPage>
    );
};

export default SkinColorAnalysisPage;