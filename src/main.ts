import * as sq3 from "sqlite3";

const removeSqlite3CommentLines = (sql: string) =>
  sql.replace(/^\s*--.*$/gmu, "");

export class Sqlite3Plus {
  constructor(readonly db: sq3.Database) {}

  static open = (filename: string) =>
    new Promise<Sqlite3Plus>((resolve, reject) => {
      // WARNING: If `mode` argument is provided, it must not be undefined,
      // as otherwise the library will think it's omitted and interpret the `mode`
      // arg as the callback, meaning the actual callback never gets called.
      const db = new sq3.Database(filename, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(new Sqlite3Plus(db));
        }
      });
    });

  close = new Promise<void>((resolve, reject) => {
    this.db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  query = <R extends {}>(statement: string, params?: any[]) =>
    new Promise<R[]>((resolve, reject) => {
      this.db.all(statement, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

  run = (statement: string, params?: any[]) =>
    new Promise<{ lastId: number; changes: number }>((resolve, reject) => {
      this.db.run(statement, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            lastId: this.lastID,
            changes: this.changes,
          });
        }
      });
    });

  exec = (sql: string) =>
    new Promise<void>((resolve, reject) => {
      // node-sqlite3 does not support comments in `exec`.
      this.db.exec(removeSqlite3CommentLines(sql), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
}
