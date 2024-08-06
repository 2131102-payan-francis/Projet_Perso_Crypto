// Fichier src/styles/EcranListeCoinGeckoStyles.ts

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#000',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 50,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        borderRadius: 5,
        backgroundColor: '#fff',
        color: '#000',
        paddingHorizontal: 10,
    },
    refreshButton: {
        marginLeft: 10,
        paddingHorizontal: 15,
        paddingVertical: 10, // Ajoute une marge en haut et en bas
        backgroundColor: '#000',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2, // Ajoute un liseré
        borderColor: 'gold', // Couleur du liseré
    },
    refreshButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#1c1c1c',
    },
    headerText: {
        color: '#fff',
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    logo: {
        width: 20,
        height: 20,
        marginHorizontal: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        backgroundColor: '#000',
        padding: 10,
        borderRadius: 5,
        textAlign: 'center',
        marginTop: 10,
    },
});
