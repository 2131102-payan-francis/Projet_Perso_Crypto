// Fichier src/ecrans/EcranAccueil.tsx

/**
 * Code partiellement généré par ChatGPT et GitHub Copilot.
 * @see https://chatgpt.com/
 */

import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from '../styles/EcranAccueilStyles';
import { ContexteBaseDeDonnees } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EcranAccueilNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Accueil'>;

/**
 * Écran d'accueil de l'application.
 */
function EcranAccueil() {
  const navigation = useNavigation<EcranAccueilNavigationProp>(); // Hook de navigation pour rediriger l'utilisateur vers un autre écran
  const { cryptos } = useContext(ContexteBaseDeDonnees); // Contexte partagé entre les différents composants de l'application pour accéder à la liste des cryptos enregistrées dans la base de données 
  const images = [ // Tableau des images de fond disponibles pour l'écran d'accueil 
    require('../../images/fond_1.png'),
    require('../../images/fond_2.png'),
    require('../../images/fond_3.png'),
    require('../../images/fond_4.png'),
    require('../../images/fond_5.png'),
    require('../../images/fond_6.png'),
    require('../../images/fond_7.png'),
    require('../../images/fond_8.png'),
    require('../../images/fond_9.png'),
    require('../../images/fond_10.png'),
    require('../../images/fond_11.png'),
    require('../../images/fond_12.png'),
    require('../../images/fond_13.png'),
    require('../../images/fond_14.png'),
    require('../../images/fond_15.png'),
    require('../../images/fond_16.png'),
    require('../../images/fond_17.png'),
    require('../../images/fond_18.png'),
    require('../../images/fond_19.png'),
    require('../../images/fond_20.png'),
    require('../../images/fond_21.png'),
    require('../../images/fond_22.png'),
    require('../../images/fond_23.png'),
  ];
  const [imageIndex, setImageIndex] = useState(0); // Index de l'image de fond actuellement affichée sur l'écran d'accueil 

  /**
   * Récupère l'index de l'image de fond enregistré dans le stockage local de l'appareil.
   * 
   * Cette fonction est exécutée une seule fois, lors du premier affichage de l'écran d'accueil.
   * Elle permet de restaurer l'image de fond précédemment sélectionnée par l'utilisateur.
   * Si aucune image n'a été sélectionnée, l'index par défaut est 0 (première image du tableau).
   */
  useEffect(() => {
    const loadImageIndex = async () => { // Fonction asynchrone pour récupérer l'index de l'image de fond dans le stockage local
      try {
        const savedIndex = await AsyncStorage.getItem('imageIndex'); // Récupère la valeur associée à la clé 'imageIndex' dans le stockage local
        if (savedIndex !== null) { // Si une valeur est trouvée, l'index de l'image de fond est mis à jour avec cette valeur 
          setImageIndex(parseInt(savedIndex, 10)); // Conversion de la valeur en nombre entier (base 10)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'index de l\'image de fond:', error);
      }
    };
    loadImageIndex(); // Appel de la fonction pour récupérer l'index de l'image de fond lors de l'affichage de l'écran d'accueil
  }, []); // Le tableau vide [] en deuxième argument indique que cette fonction doit être exécutée une seule fois, lors du premier affichage de l'écran d'accueil

  /**
   * Fonction asynchrone pour changer l'image de fond affichée sur l'écran d'accueil.
   * 
   * Cette fonction est appelée lorsqu'un utilisateur appuie sur le bouton "Changer l'image de fond".
   * Elle incrémente l'index de l'image de fond actuellement affichée, en bouclant sur le tableau des images.
   * L'index de l'image de fond est ensuite enregistré dans le stockage local de l'appareil.
   * Si l'index atteint la fin du tableau, il est réinitialisé à 0 pour afficher la première image.
   */
  const changerImageFond = async () => {
    let nouvelIndex = imageIndex + 1; // Incrémentation de l'index de l'image de fond actuellement affichée 
    if (nouvelIndex >= images.length) { // Si l'index dépasse la taille du tableau, il est réinitialisé à 0 pour afficher la première image
      nouvelIndex = 0; 
    }
    setImageIndex(nouvelIndex); // Mise à jour de l'index de l'image de fond affichée sur l'écran d'accueil 
    try {
      await AsyncStorage.setItem('imageIndex', nouvelIndex.toString()); // Enregistrement de l'index de l'image de fond dans le stockage local de l'appareil 
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'index de l\'image de fond:', error);
    }
  };

  /**
   * Affiche l'écran d'accueil de l'application.
   */
  return (
    <ImageBackground source={images[imageIndex]} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Portefeuille Crypto</Text>
        <Button
          mode="contained" 
          onPress={() => navigation.navigate('ListeCryptos')}
          style={styles.button} 
          labelStyle={styles.buttonText}
        >
          Portfolio
        </Button>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('AjouterCrypto')}
          style={styles.button} 
          labelStyle={styles.buttonText}
        >
          Ajouter une nouvelle crypto
        </Button>
        <Button
          mode="contained" 
          onPress={changerImageFond} 
          style={styles.button} 
          labelStyle={styles.buttonText}
        >
          Changer l'image de fond
        </Button>
        <Button
          mode="contained" 
          onPress={() => navigation.navigate('ListeCoinGecko')} 
          style={styles.button} 
          labelStyle={styles.buttonText}
        >
          Voir les prix actuels (CoinGecko)
        </Button>
      </View>
    </ImageBackground>
  );
}

export default EcranAccueil;
