// Fichier App.tsx

/**
 * Code partiellement généré par ChatGPT et GitHub Copilot.
 * @see https://chatgpt.com/
 */

import React, { useState, useEffect, useContext, createContext } from 'react';
import { View, Alert, Text, TouchableOpacity, ImageBackground, Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EcranAccueil from './src/ecrans/EcranAccueil';
import EcranListeCryptos from './src/ecrans/EcranListeCryptos';
import EcranAjoutAchat from './src/ecrans/EcranAjoutAchat';
import EcranAjoutVente from './src/ecrans/EcranAjoutVente';
import EcranAjoutCrypto from './src/ecrans/EcranAjoutCrypto';
import EcranListeCoinGecko from './src/ecrans/EcranListeCoinGecko';
import EcranHistoriqueCrypto from './src/ecrans/EcranHistoriqueCrypto';
import { Crypto } from './src/modeles/Crypto';
import { getDBConnection, createCryptoTable, createTopCryptoTable, createAchatTable, createVenteTable, obtenirCryptos, insererTopCryptos, listTables } from './src/database/db-service';
import { obtenirTopCryptos } from './src/api/crypto-api';

enableScreens(); // sert à optimiser la navigation entre les écrans en utilisant des composants natifs pour chaque écran 

/**
 * Paramètres de navigation de l'application
 */
export type RootStackParamList = { // définir les écrans de l'application et les paramètres qu'ils peuvent recevoir 
  Accueil: undefined; // écran d'accueil sans paramètres 
  ListeCryptos: undefined;
  AjouterCrypto: undefined;
  AjouterAchat: { cryptoId: number; cryptoNom: string }; // écran d'ajout d'achat avec les paramètres cryptoId et cryptoNom
  AjouterVente: { cryptoId: number; cryptoNom: string }; // écran d'ajout de vente avec les paramètres cryptoId et cryptoNom
  ModifierCrypto: { crypto: Crypto }; // écran de modification de crypto avec le paramètre crypto
  HistoriqueCrypto: { cryptoId: number; cryptoNom: string }; // écran d'historique de crypto avec les paramètres cryptoId et cryptoNom
  ListeCoinGecko: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>(); // créer un stack de navigation avec les paramètres de type RootStackParamList 

/**
 * Contexte pour la base de données permettant de partager les données entre les composants 
 */
export const ContexteBaseDeDonnees = createContext<{ // créer un contexte pour la base de données permettant de partager les données entre les composants
  cryptos: Crypto[]; // liste des cryptos 
  setCryptos: React.Dispatch<React.SetStateAction<Crypto[]>>; // fonction pour mettre à jour la liste des cryptos 
  darkMode: boolean; // mode sombre activé ou non 
  toggleDarkMode: () => void; // fonction pour activer ou désactiver le mode sombre 
}>({
  cryptos: [], // initialiser la liste des cryptos à vide pour éviter les erreurs 
  setCryptos: () => {}, // initialiser la fonction de mise à jour à une fonction vide afin d'éviter les erreurs
  darkMode: false, // initialiser le mode sombre à faux par défaut 
  toggleDarkMode: () => {}, // initialiser la fonction de basculement du mode sombre à une fonction vide pour éviter les erreurs 
});

/**
 * Composant principal de l'application
 * @returns Composant principal de l'application
 */
function App() { // composant principal de l'application 
  const [cryptos, setCryptos] = useState<Crypto[]>([]); // état local pour stocker la liste des cryptos 
  const [darkMode, setDarkMode] = useState(false); // état local pour stocker l'état du mode sombre 
  
  /**
   * Fonction asynchrone pour activer ou désactiver le mode sombre
   * @returns Promise<void> qui ne renvoie rien
   */
  const toggleDarkMode = async () => { // fonction pour activer ou désactiver le mode sombre 
    const newDarkMode = !darkMode; // inverser l'état actuel du mode sombre lors de l'appel de la fonction 
    setDarkMode(newDarkMode); // mettre à jour l'état local du mode sombre avec la nouvelle valeur 
    await AsyncStorage.setItem('darkMode', JSON.stringify(newDarkMode)); // enregistrer la nouvelle valeur du mode sombre dans le stockage local, await est utilisé pour attendre la fin de l'opération avant de continuer 
  };
  
  /**
   * Effet pour charger les données lors du montage du composant 
   * permettant de charger les données de la base de données et l'état du mode sombre
   */
  useEffect(() => { // fonction pour charger les données lors du montage du composant 
    const chargerDonnees = async () => { // fonction asynchrone pour charger les données permettant d'attendre la fin de chaque opération avant de continuer 
      try { // bloc try-catch pour gérer les erreurs potentielles 
        const db = await getDBConnection(); // obtenir une connexion à la base de données 
        await createCryptoTable(db); // créer la table des cryptos 
        await createTopCryptoTable(db); // créer la table des cryptos du top 1000
        await createAchatTable(db); // créer la table des achats 
        await createVenteTable(db); // créer la table des ventes 
        await listTables(db); // lister les tables de la base de données pour vérifier qu'elles ont été créées avec succès 

        /**
         * Vérifier si des cryptos sont enregistrés dans la base de données
         * 
         * Si aucune crypto n'est enregistrée, les récupérer depuis l'API CoinGecko
         * Sinon, les récupérer depuis la base de données
         * Enfin, mettre à jour la liste des cryptos avec les données récupérées 
         */
        const cryptosEnregistres = await obtenirCryptos(db); // obtenir les cryptos enregistrés dans la base de données 
        if (cryptosEnregistres.length === 0) { // s'il n'y a pas de cryptos enregistrés, les récupérer depuis l'API CoinGecko 
          const topCryptos = await obtenirTopCryptos(); // obtenir les cryptos du top 1000 depuis l'API CoinGecko 
          const cryptos = topCryptos.map(crypto => ({ // mapper les cryptos du top 1000 pour les insérer dans la base de données 
            id: 0, // l'identifiant est généré automatiquement par la base de données 
            nom: crypto.name, 
            acronyme: crypto.symbol,
            logo: crypto.image || '', // l'image est optionnelle, donc on utilise une chaîne vide par défaut 
          }));
          await insererTopCryptos(cryptos); // insérer les cryptos du top 1000 dans la base de données au moment du premier lancement de l'application 
        }

        setCryptos(await obtenirCryptos(db)); // mettre à jour la liste des cryptos avec les données récupérées de la base de données 
      } catch (error) { // gérer les erreurs potentielles
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    /**
     * Fonction asynchrone pour charger l'état du mode sombre
     */
    const chargerDarkMode = async () => {
      const savedDarkMode = await AsyncStorage.getItem('darkMode'); // récupérer l'état du mode sombre depuis le stockage local 
      if (savedDarkMode !== null) { // si l'état du mode sombre est enregistré, le charger 
        setDarkMode(JSON.parse(savedDarkMode)); // mettre à jour l'état local du mode sombre avec la valeur enregistrée 
      }
    };

    chargerDonnees(); // appeler la fonction pour charger les données lors du montage du composant 
    chargerDarkMode(); // appeler la fonction pour charger l'état du mode sombre lors du montage du composant
  }, []);

  /**
   * Styles pour l'en-tête de la navigation
   */
  const headerStyles: NativeStackNavigationOptions = {
    headerStyle: { 
      backgroundColor: '#000', // Fond noir
    },
    headerTintColor: '#fff', // Texte blanc
    headerTitleStyle: {
      fontWeight: 'bold' as 'bold', // Correction du type de fontWeight
    },
  };

  /**
   * Retourner l'interface de l'application
   */
  return (
    <ContexteBaseDeDonnees.Provider value={{ cryptos, setCryptos, darkMode, toggleDarkMode }}> 
      <NavigationContainer>
        <Stack.Navigator screenOptions={headerStyles}>
          <Stack.Screen
            name="Accueil" 
            component={EcranAccueil}
            options={{
              title: 'Portefeuille Crypto',
              headerRight: () => (
                <TouchableOpacity onPress={toggleDarkMode} style={styles.darkModeButton}>
                  <Image source={require('./assets/logo-dark-mode.png')} style={styles.darkModeImage} />
                </TouchableOpacity>
              ),
            }}
          />
          <Stack.Screen
            name="ListeCryptos" 
            component={EcranListeCryptos} 
            options={{
              title: 'Mon Portefeuille',
              headerRight: () => (
                <TouchableOpacity onPress={toggleDarkMode} style={styles.darkModeButton}> 
                  <Image source={require('./assets/logo-dark-mode.png')} style={styles.darkModeImage} />
                </TouchableOpacity>
              ),
            }}
          />
          <Stack.Screen name="AjouterCrypto" component={EcranAjoutCrypto} options={{ title: 'Ajouter une Crypto' }} />
          <Stack.Screen name="AjouterAchat" component={EcranAjoutAchat} options={{ title: 'Ajouter un Achat' }} />
          <Stack.Screen name="AjouterVente" component={EcranAjoutVente} options={{ title: 'Ajouter une Vente' }} />
          <Stack.Screen name="HistoriqueCrypto" component={EcranHistoriqueCrypto} options={{ title: 'Historique de Crypto' }}/>
          <Stack.Screen name="ListeCoinGecko" component={EcranListeCoinGecko} options={{ title: 'Prix des Cryptos (CoinGecko)' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ContexteBaseDeDonnees.Provider>
  );
}

/**
 * Styles pour le bouton du mode sombre 
 */
const styles = StyleSheet.create({
  darkModeButton: {
    marginRight: 15,
    borderRadius: 25, // Pour rendre le bouton parfaitement rond
    borderWidth: 2,
    borderColor: 'gold',
    overflow: 'hidden', // Pour que l'image ronde ne déborde pas du bouton
    width: 40, // Largeur du bouton rond
    height: 40, // Hauteur du bouton rond
  },
  darkModeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Pour que l'image couvre toute la surface du bouton
  },
});

export default App;