import React, { useState } from 'react';
import { IonContent, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';

interface PreviewImageProps {
    photo: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const PreviewImageModal: React.FC<PreviewImageProps> = ({ photo, isOpen, onClose }) => {

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonContent fullscreen>
                <IonHeader>
                    <IonTitle>Imagen previusly taked</IonTitle>
                </IonHeader>
                {
                    photo && (
                        <img
                            src={photo}
                            style={{
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    )
                }
            </IonContent>
        </IonModal>
    );
};