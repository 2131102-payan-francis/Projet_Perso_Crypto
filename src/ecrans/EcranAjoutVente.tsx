// Fichier scr/ecrans/EcranAjoutVente.tsx

/**
 * Code partiellement généré par ChatGPT et GitHub Copilot.
 * @see https://chatgpt.com/
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, View, Alert, TextInput, ImageBackground, Text, TouchableOpacity, Platform } from 'react-native';
import { getDBConnection, ajouterVente, obtenirCryptos, ajouterAchat } from '../database/db-service';
import { Vente, Achat } from '../modeles/Crypto';
import { styles } from '../styles/EcranAjoutVenteStyles';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import DateTimePicker from '@react-native-community/datetimepicker';

type EcranAjoutVenteRouteProp = RouteProp<RootStackParamList, 'AjouterVente'>;

/**
 * Écran permettant d'ajouter une vente de cryptomonnaie.
 * 
 * L'utilisateur peut saisir le prix de vente, le montant vendu et la date de vente.
 * Une fois les informations saisies, il peut ajouter la vente à son portefeuille.
 * Si l'ajout est effectué avec succès, un message de confirmation est affiché.
 * L'utilisateur est ensuite redirigé vers l'écran d'accueil.
 */
function EcranAjoutVente() {
  const [prixVente, setPrixVente] = useState(''); // Prix de vente de la cryptomonnaie
  const [montantVendu, setMontantVendu] = useState(''); // Montant vendu de la cryptomonnaie
  const [dateVente, setDateVente] = useState(new Date()); // Date de vente de la cryptomonnaie
  const [showDatePicker, setShowDatePicker] = useState(false); // Affichage du sélecteur de date
  const [usdcExists, setUsdcExists] = useState(false); // Vérifie si la cryptomonnaie USDC existe
  const [usdcId, setUsdcId] = useState<number | null>(null); // Identifiant de la cryptomonnaie USDC
  const navigation = useNavigation(); // Hook de navigation pour rediriger l'utilisateur vers un autre écran
  const route = useRoute<EcranAjoutVenteRouteProp>(); // Récupère les paramètres de la route

  const { cryptoId, cryptoNom } = route.params; // Identifiant et nom de la cryptomonnaie sélectionnée

  /**
   * Vérifie si la cryptomonnaie USDC existe dans la base de données.
   * 
   * Si la cryptomonnaie USDC existe, son identifiant est enregistré.
   * Si la cryptomonnaie USDC n'existe pas, l'utilisateur est invité à l'ajouter.
   * Cette vérification est effectuée une seule fois, lors du premier affichage de l'écran d'ajout de vente.
   * Elle permet de s'assurer que la cryptomonnaie USDC est disponible pour les transactions.
    */
  useEffect(() => {
    const checkUsdcExists = async () => { // Fonction asynchrone pour vérifier l'existence de la cryptomonnaie USDC
      try {
        const db = await getDBConnection(); // Connexion à la base de données
        const cryptos = await obtenirCryptos(db); // Récupération de la liste des cryptomonnaies enregistrées dans la base de données
        const usdcCrypto = cryptos.find(crypto => crypto.acronyme.toUpperCase() === 'USDC'); // Recherche de la cryptomonnaie USDC dans la liste
        if (usdcCrypto) { // Si la cryptomonnaie USDC existe
          setUsdcExists(true); // Mise à jour de l'état pour indiquer que la cryptomonnaie USDC existe
          setUsdcId(usdcCrypto.id); // Enregistrement de l'identifiant de la cryptomonnaie USDC
        } else { // Si la cryptomonnaie USDC n'existe pas
          setUsdcExists(false);  // Mise à jour de l'état pour indiquer que la cryptomonnaie USDC n'existe pas
          setUsdcId(null); // Réinitialisation de l'identifiant de la cryptomonnaie USDC
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'existence de USDC :", error);
      }
    };
    checkUsdcExists(); // Appel de la fonction pour vérifier l'existence de la cryptomonnaie USDC
  }, []); // Le tableau vide [] en deuxième argument indique que cette fonction doit être exécutée une seule fois, lors du premier affichage de l'écran

  /**
   * Enregistre la vente de la cryptomonnaie dans la base de données.
   * 
   * Si le prix de vente et le montant vendu sont renseignés, la vente est ajoutée.
   * Si la cryptomonnaie USDC n'existe pas, un message d'erreur est affiché.
   * Si l'ajout est effectué avec succès, un message de confirmation est affiché.
   * L'utilisateur est ensuite redirigé vers l'écran d'accueil.
   */
  const enregistrerVente = async () => {
    if (!prixVente || !montantVendu) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (!usdcExists) {
      Alert.alert("Erreur", "Veuillez ajouter la crypto USDC avant d'enregistrer une vente.");
      return;
    }

    /**
     * Vente de la cryptomonnaie.
     */
    const nouvelleVente: Vente = {
      id: 0,
      cryptoId,
      prixVente: parseFloat(prixVente),
      montantVendu: parseFloat(montantVendu),
      dateVente: dateVente.toISOString().split('T')[0], // Date de vente, format YYYY-MM-DD 
    };

    /**
     * Achat de la cryptomonnaie USDC.
     */
    const nouvelAchatUsdc: Achat = {
      id: 0,
      cryptoId: usdcId!,
      prixAchat: 1,
      montantInvesti: parseFloat(montantVendu),
      dateAchat: new Date().toISOString().split('T')[0], // Date du jour de l'achat, format YYYY-MM-DD 
    };

    try { // Ajout de la vente et de l'achat USDC dans la base de données
      const db = await getDBConnection(); 
      await ajouterVente(db, nouvelleVente); 
      await ajouterAchat(db, nouvelAchatUsdc);
      Alert.alert("Succès", "Vente ajoutée avec succès.", [
        { text: "OK", onPress: () => navigation.navigate('Accueil') }
      ]);
      setPrixVente('');
      setMontantVendu('');
      setDateVente(new Date());
    } catch (error) {
      console.error("Erreur lors de l'ajout de la vente :", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'ajout de la vente.");
    }
  };

  /**
   * Fonction pour gérer le changement de date sélectionnée.
   * 
   * Cette fonction est appelée lorsque l'utilisateur sélectionne une date dans le sélecteur de date.
   * Elle met à jour la date de vente en fonction de la date sélectionnée.
   * Si l'utilisateur annule la sélection, le sélecteur de date est masqué.
   */
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateVente; // Récupération de la date sélectionnée ou de la date actuelle
    setShowDatePicker(Platform.OS === 'ios'); // Affichage du sélecteur de date sur iOS
    setDateVente(currentDate); // Mise à jour de la date de vente
  };

  /**
   * Affiche l'écran d'ajout de vente de cryptomonnaie.
   */
  return (
    <ImageBackground source={require('../../images/fond_18.png')} style={styles.backgroundImage}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Prix de vente - {cryptoNom}</Text>
              <TextInput
                placeholder="Prix de vente"
                value={prixVente}
                onChangeText={setPrixVente}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Montant vendu</Text>
              <TextInput
                placeholder="Montant vendu"
                value={montantVendu}
                onChangeText={setMontantVendu}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date de vente</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <Text style={styles.dateText}>{dateVente.toISOString().split('T')[0]}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateVente}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>
            <TouchableOpacity onPress={enregistrerVente} style={styles.button}>
              <Text style={styles.buttonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

export default EcranAjoutVente;
