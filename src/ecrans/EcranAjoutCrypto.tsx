// Fichier src/ecrans/EcranAjoutCrypto.tsx

/**
 * Code partiellement généré par ChatGPT et GitHub Copilot.
 * @see https://chatgpt.com/
 */

import React, { useState, useEffect, useContext } from 'react';
import { View, Alert, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { getDBConnection, ajouterCrypto, obtenirTopCryptos, obtenirCryptos } from '../database/db-service';
import { Crypto } from '../modeles/Crypto';
import { styles } from '../styles/EcranAjoutCryptoStyles';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { ContexteBaseDeDonnees } from '../../App';

/**
 * Écran permettant d'ajouter une cryptomonnaie au portefeuille.
 * 
 * L'utilisateur peut sélectionner une cryptomonnaie parmi une liste prédéfinie.
 * Une fois la cryptomonnaie sélectionnée, il peut l'ajouter à son portefeuille.
 * Si la cryptomonnaie est déjà présente dans le portefeuille, un message d'erreur est affiché.
 * Si l'ajout est effectué avec succès, un message de confirmation est affiché.
 * L'utilisateur est ensuite redirigé vers l'écran d'accueil.
 */
function EcranAjoutCrypto() {
  const { setCryptos } = useContext(ContexteBaseDeDonnees); // Contexte partagé entre les différents composants de l'application pour mettre à jour la liste des cryptos enregistrées dans la base de données
  const [nom, setNom] = useState(''); // Nom de la cryptomonnaie sélectionnée 
  const [acronyme, setAcronyme] = useState(''); // Acronyme de la cryptomonnaie sélectionnée
  const [logo, setLogo] = useState(''); // Logo de la cryptomonnaie sélectionnée
  const [topCryptos, setTopCryptos] = useState<Crypto[]>([]); // Liste des cryptomonnaies disponibles pour l'ajout
  const [open, setOpen] = useState(false); // État de l'ouverture du sélecteur de cryptomonnaies 
  const [value, setValue] = useState<string | null>(null); // Valeur sélectionnée dans le sélecteur de cryptomonnaies
  const [items, setItems] = useState<{ label: string, value: string }[]>([]); // Liste des éléments à afficher dans le sélecteur de cryptomonnaies
  const navigation = useNavigation(); // Hook de navigation pour rediriger l'utilisateur vers un autre écran 

  /**
   * Récupère la liste des cryptomonnaies disponibles pour l'ajout.
   * 
   * Cette fonction est exécutée une seule fois, lors du premier affichage de l'écran d'ajout de cryptomonnaie.
   * Elle permet de charger les cryptomonnaies depuis la base de données et de les afficher dans le sélecteur.
   */
  useEffect(() => {
    const fetchTopCryptos = async () => { // Fonction asynchrone pour récupérer les cryptomonnaies depuis la base de données 
      try {
        const db = await getDBConnection(); // Connexion à la base de données
        const topCryptos = await obtenirTopCryptos(db); // Récupération des cryptomonnaies du top 1000 depuis la base de données récupérées depuis l'API CoinGecko 
        setTopCryptos(topCryptos); // Mise à jour de la liste des cryptomonnaies disponibles pour l'ajout 
        const formattedData = topCryptos.map(crypto => ({ // Formatage des données pour le sélecteur de cryptomonnaies 
          label: `${crypto.nom} (${crypto.acronyme.toUpperCase()})`, // Affichage du nom et de l'acronyme de la cryptomonnaie 
          value: crypto.id.toString(), // Valeur associée à la cryptomonnaie (identifiant) 
        }));
        setItems(formattedData); // Mise à jour de la liste des éléments à afficher dans le sélecteur de cryptomonnaies 
      } catch (error) {
        console.error('Erreur lors de la récupération des cryptomonnaies:', error);
      }
    };
    fetchTopCryptos(); // Appel de la fonction pour récupérer les cryptomonnaies disponibles pour l'ajout 
  }, []);

  /**
   * Gère le changement de cryptomonnaie sélectionnée dans le sélecteur.
   * 
   * Cette fonction est appelée à chaque fois que l'utilisateur sélectionne une cryptomonnaie.
   * Elle met à jour les états de nom, acronyme et logo de la cryptomonnaie sélectionnée.
   * @param itemValue - Identifiant de la cryptomonnaie sélectionnée
   */
  const handleCryptoChange = (itemValue: string | null) => {
    if (itemValue) { // Vérifie si une cryptomonnaie a été sélectionnée 
      const selectedCrypto = topCryptos.find(crypto => crypto.id.toString() === itemValue); // Recherche de la cryptomonnaie correspondant à l'identifiant sélectionné
      if (selectedCrypto) { // Vérifie si la cryptomonnaie a été trouvée
        setNom(selectedCrypto.nom); // Mise à jour du nom de la cryptomonnaie sélectionnée
        setAcronyme(selectedCrypto.acronyme); // Mise à jour de l'acronyme de la cryptomonnaie sélectionnée
        setLogo(selectedCrypto.logo ?? ''); // Mise à jour du logo de la cryptomonnaie sélectionnée (s'il existe) 
      }
    }
  };

  /**
   * Enregistre la cryptomonnaie sélectionnée dans le portefeuille de l'utilisateur.
   * 
   * Cette fonction est appelée lorsque l'utilisateur appuie sur le bouton "Ajouter".
   * Elle vérifie si une cryptomonnaie a été sélectionnée, puis l'ajoute à la base de données.
   * Si la cryptomonnaie est déjà présente dans le portefeuille, un message d'erreur est affiché.
   * Si l'ajout est effectué avec succès, un message de confirmation est affiché.
   * L'utilisateur est ensuite redirigé vers l'écran d'accueil.
   */
  const enregistrerCrypto = async () => {
    if (!nom) { // Vérifie si une cryptomonnaie a été sélectionnée 
      Alert.alert("Erreur", "Veuillez sélectionner une cryptomonnaie."); // Affiche un message d'erreur si aucune cryptomonnaie n'a été sélectionnée
      return;
    }
    
    /**
     * Crée un objet Crypto à partir des informations de la cryptomonnaie sélectionnée.
     * Cet objet est utilisé pour ajouter la cryptomonnaie à la base de données.
     */
    const nouvelleCrypto: Crypto = {
      id: 0, // L'identifiant est généré automatiquement par la base de données 
      nom,
      acronyme,
      logo,
    };

    try {
      const db = await getDBConnection(); // Connexion à la base de données 
      const cryptosExistants = await obtenirCryptos(db); // Récupération des cryptomonnaies enregistrées dans le portefeuille
      const cryptoDejaPresente = cryptosExistants.find(crypto => crypto.nom === nom && crypto.acronyme === acronyme); // Vérifie si la cryptomonnaie est déjà présente dans le portefeuille

      if (cryptoDejaPresente) { // Si la cryptomonnaie est déjà présente, affiche un message d'erreur
        Alert.alert("Erreur", "Cette cryptomonnaie est déjà dans le portefeuille.");
        return;
      }

      await ajouterCrypto(db, nouvelleCrypto); // Ajout de la cryptomonnaie à la base de données
      const cryptosEnregistres = await obtenirCryptos(db); // Récupération des cryptomonnaies enregistrées après l'ajout de la nouvelle cryptomonnaie
      setCryptos(cryptosEnregistres); // Mise à jour de la liste des cryptomonnaies enregistrées dans le contexte partagé 
      Alert.alert("Succès", "Cryptomonnaie ajoutée avec succès.", [ // Affiche un message de confirmation
        { text: "OK", onPress: () => navigation.navigate('Accueil') } // Redirige l'utilisateur vers l'écran d'accueil après confirmation
      ]);
      setNom(''); // Réinitialisation des états de la cryptomonnaie sélectionnée 
      setAcronyme(''); 
      setLogo('');
      setValue(null);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la cryptomonnaie :", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'ajout de la cryptomonnaie.");
    }
  };

  /**
   * Affiche l'écran d'ajout de cryptomonnaie.
   */
  return (
    <ImageBackground source={require('../../imagesAjoutModifier/ecran_ajout.jpg')} style={styles.backgroundImage}> 
      <View style={styles.container}>
        <Text style={styles.label}>Sélectionner une Crypto</Text>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen} 
          setValue={setValue} 
          setItems={setItems} 
          searchable={true}  
          placeholder="Tapez le nom de la crypto" 
          searchPlaceholder="Rechercher une crypto"
          onChangeValue={handleCryptoChange}
          style={styles.picker}
          dropDownContainerStyle={styles.dropDownContainer}
          listMode="SCROLLVIEW" 
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
          textStyle={styles.dropDownText}
          searchTextInputStyle={styles.searchInput}
          zIndex={1000} 
        />
        <TouchableOpacity onPress={enregistrerCrypto} style={styles.button}>
          <Text style={styles.buttonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

export default EcranAjoutCrypto;
