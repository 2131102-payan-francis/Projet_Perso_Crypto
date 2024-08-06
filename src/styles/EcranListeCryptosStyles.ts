// Fichier src/styles/EcranAjoutAchatStyles.ts

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    card: {
        marginBottom: 10,
        borderRadius: 10,
        elevation: 3,
        backgroundColor: '#ffffff',
        borderWidth: 1, // Ajouter un liseré
        borderColor: '#007bff', // Couleur du liseré bleu
    },
    cardDark: {
        marginBottom: 10,
        borderRadius: 10,
        elevation: 3,
        backgroundColor: '#000', // Remplacer le gris par du noir
        borderWidth: 1, // Ajouter un liseré
        borderColor: 'white', // Couleur du liseré doré
    },
    cardContent: {
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    titleDark: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    paragraph: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    paragraphDark: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 5,
    },
    boldText: {
        fontWeight: 'bold', 
        color: '#333', 
    },
    boldTextDark: {
        fontWeight: 'bold',
        color: '#fff',
    },
    boldTextBleu: {
        fontWeight: 'bold', 
        color: '#007bff', 
    },
    boldTextBleuDark: {
        fontWeight: 'bold',
        color: '#80bfff',
    },
    logoContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginLeft: 10,
        marginBottom: 10,
    },
    logo: {
        width: 40, 
        height: 40, 
        borderRadius: 30, 
        marginBottom: 20, 
    },
    buttonsColumn: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    actionIcon: {
        width: 35, 
        height: 35, 
        borderRadius: 10, 
        marginVertical: 5, 
    },
    deleteIcon: {
        width: 35, 
        height: 35, 
        borderRadius: 10, 
        marginVertical: 5, 
    },
    historiqueButton: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007bff',
        marginVertical: 5,
        textAlign: 'center',
    },
    historiqueButtonDark: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#80bfff',
        marginVertical: 5,
        textAlign: 'center',
    },
    infoContainer: {
        flex: 1,
    },
    floatingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8, 
        margin: 10, 
        zIndex: 1,
        borderWidth: 1, // Ajouter un liseré
        borderColor: '#007bff', // Couleur du liseré bleu
    },
    floatingContainerDark: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000', // Remplacer le gris par du noir
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#555',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8, 
        margin: 10, 
        zIndex: 1,
        borderWidth: 1, // Ajouter un liseré
        borderColor: 'gold', // Couleur du liseré doré
    },
    floatingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    floatingTextDark: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    image: {
        height: 150,
        resizeMode: 'contain',
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
    },
    backgroundImageDark: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    container: {
        padding: 20,
        paddingTop: 100,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});
