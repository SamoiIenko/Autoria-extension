import sql from 'mysql';
import Config from '../models/Config.js';

var closeConnectionTimeout = null;

export class DB {
  constructor(query) {
    this.query = query;
    var config = new Config();
    this.connectionString = config.connectionString;
  }

  ExecuteQuery(query) {
    return new Promise(resolve => {
      try {  
        const connection = sql.createConnection({
          host: "localhost",
          user: "root",
          database: "autoria",
          password: "root"
        });
  
        connection.connect();
  
        connection.query(query, (err, result, fields) => {
          console.log(err);
          resolve(result);
        });
  
        connection.end();
  
      } catch (error) {
        resolve(error);
        throw error;
      }
    })
    
  }

  async ExecuteScalar(query) {
    try {
      await sql.connect(this.connectionString);
      const result = await sql.query(`${query}`);
      await sql.close();
  
      return result;
    } catch (error) {
      console.error(error);
    }
  }
}


export default DB;