// Fichier src/ecrans/EcranAjoutAchat.tsx

/**
 * Code partiellement généré par ChatGPT et GitHub Copilot.
 * @see https://chatgpt.com/
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, View, Alert, TextInput, ImageBackground, Text, TouchableOpacity, Platform, Switch } from 'react-native';
import { getDBConnection, ajouterAchat, ajouterVente, obtenirCryptos, obtenirAchats, obtenirVentes } from '../database/db-service';
import { Achat, Vente, Crypto } from '../modeles/Crypto';
import { styles } from '../styles/EcranAjoutAchatStyles';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import DateTimePicker from '@react-native-community/datetimepicker';

type EcranAjoutAchatRouteProp = RouteProp<RootStackParamList, 'AjouterAchat'>;

/**
 * Écran permettant d'ajouter un achat de cryptomonnaie au portefeuille.
 * 
 * L'utilisateur peut saisir le prix d'achat, le montant investi, la date d'achat et choisir d'utiliser les USDC existants.
 * Une fois les informations saisies, il peut ajouter l'achat à son portefeuille.
 * Si l'ajout est effectué avec succès, un message de confirmation est affiché.
 * L'utilisateur est ensuite redirigé vers l'écran d'accueil.
 * Si le solde USDC est insuffisant, un message d'erreur est affiché.
 */
function EcranAjoutAchat() {
  const [prixAchat, setPrixAchat] = useState(''); // Prix d'achat de la cryptomonnaie
  const [montantInvesti, setMontantInvesti] = useState(''); // Montant investi dans la cryptomonnaie
  const [dateAchat, setDateAchat] = useState(new Date()); // Date de l'achat de la cryptomonnaie
  const [showDatePicker, setShowDatePicker] = useState(false); // Affichage du sélecteur de date
  const [useUSDC, setUseUSDC] = useState(false); // Utilisation des USDC existants pour l'achat
  const [usdcCrypto, setUsdcCrypto] = useState<Crypto | null>(null); // Cryptomonnaie USDC
  const [usdcTotal, setUsdcTotal] = useState<number>(0); // Solde total des USDC
  const navigation = useNavigation(); // Hook de navigation pour rediriger l'utilisateur vers un autre écran
  const route = useRoute<EcranAjoutAchatRouteProp>(); // Route actuelle pour récupérer les paramètres passés à l'écran

  const { cryptoId, cryptoNom } = route.params; // Identifiant et nom de la cryptomonnaie sélectionnée

  /**
   * Récupère les informations sur la cryptomonnaie USDC et le solde total des USDC.
   * 
   * Cette fonction est exécutée une seule fois, lors du premier affichage de l'écran d'ajout d'achat.
   * Elle permet de récupérer les informations sur la cryptomonnaie USDC et le solde total des USDC.
   * Ces informations sont utilisées pour vérifier si l'utilisateur peut utiliser les USDC existants pour l'achat.
   * Si le solde USDC est insuffisant, un message d'erreur est affiché.
   * Si les informations sont récupérées avec succès, elles sont stockées dans l'état local de l'écran.
   */
  useEffect(() => {
    const fetchUSDC = async () => { // Fonction asynchrone pour récupérer les informations sur la cryptomonnaie USDC et le solde total des USDC
      try {
        const db = await getDBConnection(); // Connexion à la base de données
        const cryptos = await obtenirCryptos(db); // Récupération de la liste des cryptomonnaies enregistrées dans la base de données
        const usdc = cryptos.find(crypto => crypto.acronyme.toLowerCase() === 'usdc'); // Recherche de la cryptomonnaie USDC dans la liste
        if (usdc) { // Si la cryptomonnaie USDC est trouvée
          setUsdcCrypto(usdc); // Mise à jour de la cryptomonnaie USDC
          const achats = await obtenirAchats(db, usdc.id); // Récupération des achats de la cryptomonnaie USDC
          const ventes = await obtenirVentes(db, usdc.id); // Récupération des ventes de la cryptomonnaie USDC
          const totalAchats = achats.reduce((acc, achat) => acc + (achat.montantInvesti / achat.prixAchat), 0); // Calcul du total des achats en USDC
          const totalVentes = ventes.reduce((acc, vente) => acc + (vente.montantVendu / vente.prixVente), 0); // Calcul du total des ventes en USDC
          setUsdcTotal(totalAchats - totalVentes); // Mise à jour du solde total des USDC
        }
      } catch (error) { 
        console.error("Erreur lors de la récupération des USDC :", error);
      }
    };

    fetchUSDC(); // Appel de la fonction pour récupérer les informations sur la cryptomonnaie USDC et le solde total des USDC
  }, []); // Le tableau vide [] en tant que deuxième argument signifie que cette fonction est exécutée une seule fois, lors du premier affichage de l'écran

  /**
   * Enregistre l'achat de la cryptomonnaie dans la base de données.
   * 
   * Cette fonction est appelée lorsque l'utilisateur appuie sur le bouton "Ajouter".
   * Elle vérifie que les champs requis sont remplis (prix d'achat, montant investi).
   */
  const enregistrerAchat = async () => {
    if (!prixAchat || !montantInvesti) { // Vérifie si les champs requis sont remplis
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    /**
     * Crée un nouvel achat avec les informations saisies par l'utilisateur.
     */
    const nouvelAchat: Achat = {
      id: 0,
      cryptoId,
      prixAchat: parseFloat(prixAchat), // Conversion du prix d'achat en nombre décimal
      montantInvesti: parseFloat(montantInvesti), // Conversion du montant investi en nombre décimal
      dateAchat: dateAchat.toISOString().split('T')[0], // Conversion de la date d'achat en format ISO (AAAA-MM-JJ), puis extraction de la date uniquement (sans l'heure)
    };

    try {  
      const db = await getDBConnection();

      if (useUSDC && usdcCrypto) { // Vérifie si l'utilisateur souhaite utiliser les USDC existants pour l'achat
        const montantInvestiUSD = parseFloat(montantInvesti); // Conversion du montant investi en nombre décimal
        if (usdcTotal < montantInvestiUSD) { // Vérifie si le solde USDC est suffisant pour l'achat
          Alert.alert("Erreur", "Solde USDC insuffisant."); // Affiche un message d'erreur si le solde USDC est insuffisant
          return; // Arrête l'exécution de la fonction
        }

        /**
         * Crée une nouvelle vente d'USDC pour déduire le montant investi en USD.
         * 
         * La valeur de l'USDC est supposée être de 1 USD par USDC.
         * La vente est ajoutée à la base de données pour mettre à jour le solde USDC.
         * Le solde total des USDC est mis à jour en déduisant le montant investi en USD.
         */
        const nouvelleVenteUSDC: Vente = {
          id: 0,
          cryptoId: usdcCrypto.id,
          prixVente: 1, // Prix de vente de l'USDC (1 USD par USDC)
          montantVendu: montantInvestiUSD,
          dateVente: dateAchat.toISOString().split('T')[0],
        };
        await ajouterVente(db, nouvelleVenteUSDC); // Ajout de la vente d'USDC à la base de données pour déduire le montant investi en USD 

        setUsdcTotal(usdcTotal - montantInvestiUSD); // Mise à jour du solde total des USDC après la vente d'USDC 
      }

      await ajouterAchat(db, nouvelAchat); // Ajout de l'achat à la base de données 
      Alert.alert("Succès", "Achat ajouté avec succès.", [
        { text: "OK", onPress: () => navigation.navigate('Accueil') }
      ]);
      setPrixAchat(''); // Réinitialisation des champs après l'ajout de l'achat
      setMontantInvesti(''); 
      setDateAchat(new Date());
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'achat :", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'ajout de l'achat.");
    }
  };

  /**
   * Fonction pour gérer le changement de date sélectionnée dans le sélecteur de date.
   * 
   * Cette fonction est appelée lorsqu'une date est sélectionnée dans le sélecteur de date.
   * Elle met à jour la date d'achat avec la date sélectionnée par l'utilisateur.
   */
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateAchat; // Si aucune date n'est sélectionnée, la date actuelle est conservée 
    setShowDatePicker(Platform.OS === 'ios'); // Affiche le sélecteur de date sur iOS
    setDateAchat(currentDate); // Mise à jour de la date d'achat avec la date sélectionnée
  };

  /**
   * Affiche l'écran d'ajout d'achat de cryptomonnaie.
   */
  return (
    <ImageBackground source={require('../../images/fond_16.png')} style={styles.backgroundImage}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Prix d'achat - {cryptoNom}</Text>
              <TextInput
                placeholder="Prix d'achat"
                value={prixAchat}
                onChangeText={setPrixAchat}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Montant investi</Text>
              <TextInput
                placeholder="Montant investi"
                value={montantInvesti}
                onChangeText={setMontantInvesti}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Utiliser les USDC existants</Text>
              <Switch
                value={useUSDC}
                onValueChange={setUseUSDC}
              />
              {useUSDC && usdcCrypto && (
                <Text style={styles.soldeUSDC}>Solde USDC: {usdcTotal}</Text>
              )}
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date d'achat</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <Text style={styles.dateText}>{dateAchat.toISOString().split('T')[0]}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateAchat}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>
            <TouchableOpacity onPress={enregistrerAchat} style={styles.button}>
              <Text style={styles.buttonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

export default EcranAjoutAchat;
