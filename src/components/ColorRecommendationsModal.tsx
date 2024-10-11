import React from 'react';
import { IonModal, IonButton, IonContent, IonBadge } from '@ionic/react';
import './ColorRecommendationsModal.css';

interface ColorRecommendationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tonoPiel: string;
    recomendaciones: {
        labial: string[];
        base: string[];
        sombra: string[];
    } | null;
}

const ColorRecommendationsModal: React.FC<ColorRecommendationsModalProps> = ({ isOpen, onClose, tonoPiel, recomendaciones }) => {
    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonContent class='ion-text-center io-padding-horizontal io-padding-vertical'>
                <h2>Tono de piel: {tonoPiel}</h2>
                <span>Recomendaciones:</span>
                <br />
                <span>Labial:</span>
                <br />
                {recomendaciones?.labial.map((color, index) => (
                    <div key={index} className='color-box' style={{ backgroundColor: `${color.split(':')[1].toLowerCase().trim()}` }}>
                        {color.toLowerCase().split(':')[1].toLowerCase().trim()}
                    </div>
                ))}
                <br />
                <span>Base:</span>
                <br />
                {recomendaciones?.base.map((color, index) => (
                    <div key={index} className='color-box' style={{ backgroundColor: `${color.split(':')[1].toLowerCase().trim()}` }}>
                        {color.toLowerCase()}
                    </div>
                ))}
                <br />
                <span>Sombra:</span>
                <br />
                {recomendaciones?.sombra.map((color, index) => (
                        <div key={index} className='color-box' style={{ backgroundColor: `${color.split(':')[1].toLowerCase().trim()}` }}>
                            {color.toLowerCase()}
                        </div>
                ))}
                <br />
                <IonButton onClick={onClose}>Cerrar</IonButton>
            </IonContent>
        </IonModal>
    );
};

export default ColorRecommendationsModal;
