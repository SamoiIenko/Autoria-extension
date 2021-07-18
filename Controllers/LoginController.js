import DB from '../Models/DB.js';

var db = new DB();

class LoginController{
    constructor(){

    }

    async login(data) {

        try {
            const existResult = await db.ExecuteQuery(`SELECT * FROM \`users\` WHERE email = '${data.email}'`);

            if(!existResult.length > 0) {
                await db.ExecuteQuery(`INSERT INTO \`users\` (name, email) VALUES ('${data.name}', '${data.email}')`);
                const lastId = await db.ExecuteQuery(`SELECT MAX(id) as id FROM \`users\``);
              
                return {
                    success: true,
                    userId: lastId[0].id
                }
            }
           
            return {
                success: true,
                userId: existResult[0].id
            }

        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    }
}

export default LoginController;