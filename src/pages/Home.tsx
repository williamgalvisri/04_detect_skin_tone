import React from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
	const history = useHistory();

	const cameraPurposes = [
		{ name: 'Análisis de Color de Piel', route: '/skin-color-analysis' },
		{ name: 'Detección de Objetos', route: '/object-detection' },
	];

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Propósitos de la Cámara</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<IonList>
					{cameraPurposes.map((purpose, index) => (
						<IonItem key={index} button onClick={() => history.push(purpose.route)}>
							<IonLabel>{purpose.name}</IonLabel>
						</IonItem>
					))}
				</IonList>
			</IonContent>
		</IonPage>
	);
};

export default Home;