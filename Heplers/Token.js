import { DB } from '../models/DB.js';
import { v4 as uuidv4 } from 'uuid';

let db = new DB;

export class Token {
  constructor() {}

  async validToken(token) {
    let query = `SELECT * FROM [UserToken] WHERE Token = '${token}'`;
    let result = await db.ExecuteQuery(query);

    if (result.Rows.length === 0) {
      return 0;
    } else {
      let resultToken = result.Rows[0]["Token"].toSring();
      let resultUserId = result.Rows[0]["UserId"].toString();

      return parseInt(resultUserId);
    }
  }

  async getUserId(token) {
    let query = `SELECT UserId FROM [UserToken] WHERE Token = '${token}'`;
    let result = (await db.ExecuteQuery(query)).recordset[0].UserId;
    return parseInt(result);
  }

  async createToken(userId) {
    let query = `SELECT * FROM [UserToken] WHERE UserId = ${userId}`;
    let result = db.ExecuteQuery(query);

    let key = uuidv4();
    let token = key.toString().replace('-', '');

    query = `INSERT INTO [UserToken] (UserId, Token, ExpiredTime, RefreshTime) VALUES (${userId}, '${token}', DATEADD(day, 1, getDate()), DATEADD(day, 5, getDate()))`

    await db.ExecuteQuery(query);

    return token;
  }

  async removeToken(token) {
    let query = `DELETE FROM [UserToken] WHERE Token = '${token}'`

    await db.ExecuteQuery(query);
  }
}


export default Token;