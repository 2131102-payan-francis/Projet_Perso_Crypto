declare module 'react-native-sqlite-storage' {
    export interface SQLiteDatabase {
      executeSql: (sqlStatement: string, args?: any[]) => Promise<SQLiteResultSet[]>;
      transaction: (callback: (tx: SQLiteTransaction) => void) => Promise<void>;
    }
  
    export interface SQLiteResultSet {
      insertId: any;
      length: number;
      item(i: number): import("./modeles/Crypto").Crypto;
      rows: {
        [x: string]: any;
        length: number;
        item: (index: number) => any;
      };
    }
  
    export interface SQLiteTransaction {
      executeSql: (sqlStatement: string, args?: any[]) => Promise<SQLiteResultSet>;
    }
  
    export function enablePromise(enable: boolean): void;
    export function openDatabase(params: { name: string, location: string }): Promise<SQLiteDatabase>;
  }
  