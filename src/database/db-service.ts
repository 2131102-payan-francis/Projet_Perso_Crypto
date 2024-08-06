// Fichier src/database/db-service.ts

/**
 * Code partiellement généré par ChatGPT et GitHub Copilot.
 * @see https://chatgpt.com/
 */

import { enablePromise, openDatabase, SQLiteDatabase, SQLiteResultSet } from 'react-native-sqlite-storage';
import { Crypto, Achat, Vente } from '../modeles/Crypto';

enablePromise(true); // Permet d'utiliser les promesses au lieu des callbacks pour les requêtes SQL avec SQLite afin de simplifier le code et le rendre plus lisible et maintenable.

/**
 * Fonction asynchrone permettant de se connecter à la base de données SQLite.
 * 
 * @returns Une promesse qui contient la connexion à la base de données.
 * Si la connexion réussit, la promesse est résolue avec la connexion à la base de données.
 * Sinon, la promesse est rejetée avec l'erreur de connexion.
 */
export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  try {
    const db = await openDatabase({ name: 'portefeuille-crypto.db', location: 'default' }); // Crée ou ouvre la base de données portefeuille-crypto.db dans le dossier de l'application. 
    console.log('Base de données connectée:', db);
    return db;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    throw error;
  }
};

/**
 * Fonction asynchrone permettant de créer la table tableCryptos dans la base de données.
 * 
 * Cette table contient les cryptomonnaies ajoutées par l'utilisateur dans son portefeuille.
 * @param db La connexion à la base de données.
 */
export const createCryptoTable = async (db: SQLiteDatabase): Promise<void> => {
  const createCryptoTableQuery = `
    CREATE TABLE IF NOT EXISTS tableCryptos(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      acronyme TEXT NOT NULL,
      logo TEXT
    );
  `;

  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(createCryptoTableQuery); // Exécute la requête SQL pour créer la table tableCryptos. 
      console.log('Table tableCryptos créée avec succès.');
    });
  } catch (error) {
    console.error('Erreur lors de la création de la table tableCryptos:', error);
  }
};

/**
 * Fonction asynchrone permettant de créer la table tableTopCryptos dans la base de données.
 * Cette table contient les cryptomonnaies du top 1000 de CoinGecko.
 * 
 * @param db La connexion à la base de données.
 * @returns Une promesse qui est résolue une fois la table créée.
 * Si la création réussit, la promesse est résolue.
 * Sinon, la promesse est rejetée avec l'erreur de création.
 */
export const createTopCryptoTable = async (db: SQLiteDatabase): Promise<void> => {
  const createTopCryptoTableQuery = `
    CREATE TABLE IF NOT EXISTS tableTopCryptos(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      acronyme TEXT NOT NULL,
      logo TEXT
    );
  `;

  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(createTopCryptoTableQuery); // Exécute la requête SQL pour créer la table tableTopCryptos. 
      console.log('Table tableTopCryptos créée avec succès.');
    });
  } catch (error) {
    console.error('Erreur lors de la création de la table tableTopCryptos:', error);
  }
};

/**
 * Fonction asynchrone permettant de créer la table tableAchats dans la base de données.
 * Cette table contient les achats de cryptomonnaies effectués par l'utilisateur.
 * 
 * @param db La connexion à la base de données.
 * @returns Une promesse qui est résolue une fois la table créée.
 */
export const createAchatTable = async (db: SQLiteDatabase): Promise<void> => {
  const createAchatTableQuery = `
    CREATE TABLE IF NOT EXISTS tableAchats(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cryptoId INTEGER NOT NULL,
      prixAchat REAL NOT NULL,
      montantInvesti REAL NOT NULL,
      dateAchat TEXT NOT NULL,
      FOREIGN KEY(cryptoId) REFERENCES tableCryptos(id)
    );
  `;

  try {
    await db.transaction(async (tx) => { 
      await tx.executeSql(createAchatTableQuery); // Exécute la requête SQL pour créer la table tableAchats.
      console.log('Table tableAchats créée avec succès.');
    });
  } catch (error) {
    console.error('Erreur lors de la création de la table tableAchats:', error);
  }
};

/**
 * Fonction asynchrone permettant de créer la table tableVentes dans la base de données.
 * Cette table contient les ventes de cryptomonnaies effectuées par l'utilisateur.
 * 
 * @param db La connexion à la base de données.
 * @returns Une promesse qui est résolue une fois la table créée.
 */
export const createVenteTable = async (db: SQLiteDatabase): Promise<void> => {
  const createVenteTableQuery = `
    CREATE TABLE IF NOT EXISTS tableVentes(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cryptoId INTEGER NOT NULL,
      prixVente REAL NOT NULL,
      montantVendu REAL NOT NULL,
      dateVente TEXT NOT NULL,
      FOREIGN KEY(cryptoId) REFERENCES tableCryptos(id)
    );
  `;

  try {
    await db.transaction(async (tx) => { // Démarre une transaction pour exécuter plusieurs requêtes SQL de manière atomique, c'est-à-dire que toutes les requêtes sont exécutées ou aucune n'est exécutée. 
      await tx.executeSql(createVenteTableQuery); // Exécute la requête SQL pour créer la table tableVentes. 
      console.log('Table tableVentes créée avec succès.'); 
    });
  } catch (error) {
    console.error('Erreur lors de la création de la table tableVentes:', error);
  }
};

/**
 * Fonction asynchrone permettant de vérifier si une table existe dans la base de données.
 * 
 * @param db La connexion à la base de données.
 * @param tableName Le nom de la table à vérifier.
 * @returns Une promesse qui est résolue avec un booléen indiquant si la table existe ou non.
 */
export const listTables = async (db: SQLiteDatabase): Promise<void> => {
  try {
    const results = await db.executeSql(`SELECT name FROM sqlite_master WHERE type='table'`); // Exécute la requête SQL pour récupérer les noms des tables existantes dans la base de données. 
    const tables = results[0].rows.raw().map((row: { name: any; }) => row.name); // Récupère les noms des tables à partir des résultats de la requête SQL. 
    console.log('Tables existantes:', tables); // Affiche les noms des tables existantes dans la console. 
  } catch (error) {
    console.error('Erreur lors de la récupération des tables:', error);
  }
};

/**
 * Fonction asynchrone permettant de récupérer les cryptomonnaies stockées dans la base de données.
 * 
 * @param db La connexion à la base de données.
 * @returns Une promesse qui est résolue avec un tableau de cryptomonnaies stockées dans la base de données.
 */
export const obtenirCryptos = async (db: SQLiteDatabase): Promise<Crypto[]> => {
  const cryptos: Crypto[] = [];
  try {
    const results: SQLiteResultSet[] = await db.executeSql(`SELECT id, nom, acronyme, logo FROM tableCryptos`); // Exécute la requête SQL pour récupérer les cryptomonnaies stockées dans la table tableCryptos. 
    const rows = results[0].rows; // Récupère les lignes de résultats de la requête SQL. 
    for (let i = 0; i < rows.length; i++) { // Parcourt les lignes de résultats. 
      cryptos.push(rows.item(i)); // Ajoute chaque ligne de résultat à la liste de cryptomonnaies. 
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des cryptos:', error);
  }
  return cryptos; // Retourne le tableau de cryptomonnaies.
};

/**
 * Fonction asynchrone permettant de récupérer les cryptomonnaies du top 1000 de CoinGecko stockées dans la base de données.
 * 
 * @param db La connexion à la base de données.
 * @returns Une promesse qui est résolue avec un tableau de cryptomonnaies du top 1000 de CoinGecko stockées dans la base de données.
 */
export const obtenirTopCryptos = async (db: SQLiteDatabase): Promise<Crypto[]> => {
  const cryptos: Crypto[] = []; // Initialise un tableau vide pour stocker les cryptomonnaies du top 1000 de CoinGecko.
  try {
    const results: SQLiteResultSet[] = await db.executeSql(`SELECT id, nom, acronyme, logo FROM tableTopCryptos`); // Exécute la requête SQL pour récupérer les cryptomonnaies du top 1000 de CoinGecko stockées dans la table tableTopCryptos.
    const rows = results[0].rows; // Récupère les lignes de résultats de la requête SQL. 
    for (let i = 0; i < rows.length; i++) { // Parcourt les lignes de résultats. 
      cryptos.push(rows.item(i)); // Ajoute chaque ligne de résultat à la liste de cryptomonnaies du top 1000 de CoinGecko.
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des top cryptos:', error);
  }
  return cryptos; // Retourne le tableau de cryptomonnaies du top 1000 de CoinGecko.
};

/**
 * Fonction asynchrone permettant de récupérer les achats de cryptomonnaies effectués par l'utilisateur.
 * 
 * @param db La connexion à la base de données.
 * @param cryptoId L'identifiant de la cryptomonnaie pour laquelle récupérer les achats.
 * @returns Une promesse qui est résolue avec un tableau d'achats de cryptomonnaies.
 */
export const obtenirAchats = async (db: SQLiteDatabase, cryptoId: number): Promise<Achat[]> => {
  const achats: Achat[] = []; // Initialise un tableau vide pour stocker les achats de cryptomonnaies. 
  try {
    const results = await db.executeSql(`SELECT id, cryptoId, prixAchat, montantInvesti, dateAchat FROM tableAchats WHERE cryptoId = ?`, [cryptoId]); // Exécute la requête SQL pour récupérer les achats de cryptomonnaies effectués par l'utilisateur pour une cryptomonnaie donnée.
    const rows = results[0].rows; // Récupère les lignes de résultats de la requête SQL. 
    for (let i = 0; i < rows.length; i++) { // Parcourt les lignes de résultats.
      achats.push(rows.item(i)); // Ajoute chaque ligne de résultat à la liste d'achats de cryptomonnaies. 
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des achats:', error);
  }
  return achats; // Retourne le tableau d'achats de cryptomonnaies.
};

/**
 * Fonction asynchrone permettant de récupérer les ventes de cryptomonnaies effectuées par l'utilisateur.
 * 
 * @param db La connexion à la base de données.
 * @param cryptoId L'identifiant de la cryptomonnaie pour laquelle récupérer les ventes.
 * @returns Une promesse qui est résolue avec un tableau de ventes de cryptomonnaies.
 */
export const obtenirVentes = async (db: SQLiteDatabase, cryptoId: number): Promise<Vente[]> => {
  const ventes: Vente[] = []; // Initialise un tableau vide pour stocker les ventes de cryptomonnaies.
  try {
    const results = await db.executeSql(`SELECT id, cryptoId, prixVente, montantVendu, dateVente FROM tableVentes WHERE cryptoId = ?`, [cryptoId]);
    const rows = results[0].rows; // Récupère les lignes de résultats de la requête SQL.
    for (let i = 0; i < rows.length; i++) { // Parcourt les lignes de résultats.
      ventes.push(rows.item(i)); // Ajoute chaque ligne de résultat à la liste de ventes de cryptomonnaies.
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes:', error);
  }
  return ventes; // Retourne le tableau de ventes de cryptomonnaies. 
};

/**
 * Fonction asynchrone permettant d'ajouter une cryptomonnaie dans la base de données.
 * 
 * @param db La connexion à la base de données.
 * @param crypto La cryptomonnaie à ajouter.
 * @returns Une promesse qui est résolue avec l'identifiant de la cryptomonnaie ajoutée.
 */
export const ajouterCrypto = async (db: SQLiteDatabase, crypto: Crypto): Promise<number> => {
  const insertQuery = `INSERT INTO tableCryptos (nom, acronyme, logo) VALUES (?, ?, ?)`;
  try {
    const result = await db.executeSql(insertQuery, [crypto.nom, crypto.acronyme, crypto.logo]);
    const insertId = result[0].insertId;
    console.log('Cryptomonnaie ajoutée avec succès:', crypto.nom);
    return insertId;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la cryptomonnaie :', error);
    throw error;
  }
};

/**
 * Fonction asynchrone permettant de mettre à jour une cryptomonnaie dans la base de données.
 * 
 * @param db La connexion à la base de données.
 * @param crypto La cryptomonnaie à mettre à jour.
 * @returns Une promesse qui est résolue une fois la mise à jour effectuée.
 */
export const mettreAJourCrypto = async (db: SQLiteDatabase, crypto: Crypto): Promise<void> => {
  const updateQuery = `UPDATE tableCryptos SET nom = ?, acronyme = ?, logo = ? WHERE id = ?`;
  try {
    await db.executeSql(updateQuery, [crypto.nom, crypto.acronyme, crypto.logo, crypto.id]);
    console.log('Cryptomonnaie mise à jour avec succès:', crypto.nom);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la cryptomonnaie :', error);
    throw error;
  }
};

/**
 * Fonction asynchrone permettant de supprimer une cryptomonnaie de la base de données.
 * 
 * @param db La connexion à la base de données.
 * @param id L'identifiant de la cryptomonnaie à supprimer.
 * @returns Une promesse qui est résolue une fois la suppression effectuée.
 */
export const supprimerCrypto = async (db: SQLiteDatabase, id: number): Promise<void> => {
  const deleteQuery = `DELETE FROM tableCryptos WHERE id = ?`;
  try {
    await db.executeSql(deleteQuery, [id]);
    console.log('Cryptomonnaie supprimée avec succès, ID:', id);
  } catch (error) {
    console.error('Erreur lors de la suppression de la cryptomonnaie :', error);
    throw error;
  }
};


/**
 * Fonction asynchrone permettant d'ajouter un achat dans la base de données.
 * 
 * @param db La connexion à la base de données.
 * @param achat L'achat à ajouter.
 * @returns Une promesse qui est résolue une fois l'ajout effectué.
 */
export const ajouterAchat = async (db: SQLiteDatabase, achat: Achat): Promise<void> => {
  const insertQuery = `INSERT INTO tableAchats (cryptoId, prixAchat, montantInvesti, dateAchat) VALUES (?, ?, ?, ?)`;
  try {
    await db.executeSql(insertQuery, [achat.cryptoId, achat.prixAchat, achat.montantInvesti, achat.dateAchat]);
    console.log('Achat ajouté avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'achat :', error);
    throw error;
  }
};

/**
 * Fonction asynchrone permettant d'ajouter une vente dans la base de données.
 * 
 * @param db La connexion à la base de données.
 * @param vente La vente à ajouter.
 * @returns Une promesse qui est résolue une fois l'ajout effectué.
 */
export const ajouterVente = async (db: SQLiteDatabase, vente: Vente): Promise<void> => {
  const insertQuery = `INSERT INTO tableVentes (cryptoId, prixVente, montantVendu, dateVente) VALUES (?, ?, ?, ?)`;
  try {
    await db.executeSql(insertQuery, [vente.cryptoId, vente.prixVente, vente.montantVendu, vente.dateVente]);
    console.log('Vente ajoutée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la vente :', error);
    throw error;
  }
};

/**
 * Fonction asynchrone permettant de mettre à jour un achat dans la base de données.
 * 
 * @param db La connexion à la base de données.
 * @param achat L'achat à mettre à jour.
 * @returns Une promesse qui est résolue une fois la mise à jour effectuée.
 */
export const mettreAJourAchat = async (db: SQLiteDatabase, achat: Achat): Promise<void> => {
  const updateQuery = `UPDATE tableAchats SET prixAchat = ?, montantInvesti = ?, dateAchat = ? WHERE id = ?`;
  try {
    await db.executeSql(updateQuery, [achat.prixAchat, achat.montantInvesti, achat.dateAchat, achat.id]);
    console.log('Achat mis à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'achat :', error);
    throw error;
  }
};

/**
 * Fonction asynchrone permettant de mettre à jour une vente dans la base de données.
 * 
 * @param db La connexion à la base de données.
 * @param vente La vente à mettre à jour.
 * @returns Une promesse qui est résolue une fois la mise à jour effectuée.
 */
export const mettreAJourVente = async (db: SQLiteDatabase, vente: Vente): Promise<void> => {
  const updateQuery = `UPDATE tableVentes SET prixVente = ?, montantVendu = ?, dateVente = ? WHERE id = ?`;
  try {
    await db.executeSql(updateQuery, [vente.prixVente, vente.montantVendu, vente.dateVente, vente.id]);
    console.log('Vente mise à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la vente :', error);
    throw error;
  }
};

/**
 * Fonction asynchrone permettant de supprimer un achat de la base de données.
 * 
 * @param db La connexion à la base de données.
 * @param id L'identifiant de l'achat à supprimer.
 * @returns Une promesse qui est résolue une fois la suppression effectuée.
 */
export const supprimerAchat = async (db: SQLiteDatabase, id: number): Promise<void> => {
  const deleteQuery = `DELETE FROM tableAchats WHERE id = ?`;
  try {
    await db.executeSql(deleteQuery, [id]);
    console.log('Achat supprimé avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'achat :', error);
    throw error;
  }
};

/**
 * Fonction asynchrone permettant de supprimer une vente de la base de données.
 * 
 * @param db La connexion à la base de données.
 * @param id L'identifiant de la vente à supprimer.
 * @returns Une promesse qui est résolue une fois la suppression effectuée.
 */
export const supprimerVente = async (db: SQLiteDatabase, id: number): Promise<void> => {
  const deleteQuery = `DELETE FROM tableVentes WHERE id = ?`;
  try {
    await db.executeSql(deleteQuery, [id]);
    console.log('Vente supprimée avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de la vente :', error);
    throw error;
  }
};

/**
 * Fonction asynchrone permettant d'insérer la liste de cryptomonnaies du top 1000 dans la base de données.
 * 
 * @param cryptos La liste des cryptomonnaies à insérer.
 * @returns Une promesse qui est résolue une fois les insertions effectuées.
 */
export const insererTopCryptos = async (cryptos: Crypto[]): Promise<void> => {
  try {
    const db = await getDBConnection();
    db.transaction(tx => {
      cryptos.forEach(crypto => {
        tx.executeSql(
          'INSERT INTO tableTopCryptos (nom, acronyme, logo) VALUES (?, ?, ?)',
          [crypto.nom, crypto.acronyme, crypto.logo]
        );
      });
    });
    console.log('Cryptomonnaies populaires insérées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des cryptomonnaies populaires :', error);
    throw error;
  }
};