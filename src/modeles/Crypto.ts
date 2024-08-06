// src/modeles/Crypto.ts

/**
 * Modèle de données pour une cryptomonnaie.
 */
export interface Crypto {
  id: number;
  nom: string;
  acronyme: string;
  logo?: string;
}

/**
 * Modèle de données pour une transaction d'achat.
 */
export interface Achat {
  id: number;
  cryptoId: number;
  prixAchat: number;
  montantInvesti: number;
  dateAchat: string;
}

/**
 * Modèle de données pour une transaction de vente.
 */
export interface Vente {
  id: number;
  cryptoId: number;
  prixVente: number;
  montantVendu: number;
  dateVente: string;
}