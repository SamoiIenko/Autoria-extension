import DB from '../Models/DB.js';

var db = new DB();

class WishlistController{
    constructor(){

    }

    async add(data){

        try {
            const advData = await db.ExecuteQuery(`SELECT * FROM \`wishlist\` WHERE car_id = '${data.id}'`);
            
            if(!advData.length > 0) {

                const result = await db.ExecuteQuery(`INSERT INTO \`wishlist\` 
                (image, title, price, car_id, user_id, links, mileages, locations, fuel, volume, gearbox, description, date) 
                 VALUES ('${data.image}', '${data.title}', ${data.price}, ${data.id}, ${data.userId}, '${data.link}', ${data.mileage}, '${data.location}', '${data.fuel}', ${data.volume}, '${data.gearbox}', '${data.description}', '${data.date}')`);
                console.log(result);
            }
           
            return {
                success: true
            }

        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    }

    async get(data) {

        try {
            const getData = await db.ExecuteQuery(`SELECT * FROM \`wishlist\` WHERE user_id = ${data.userId} ORDER BY favorites DESC`);
            console.log(getData);

            return {
                success: true,
                data: getData
            }

        } catch (error) {

            return {
                success: false,
                message: error
            }
        }
    }

    async remove(data) {

        try {
            const removeData = await db.ExecuteQuery(`DELETE FROM \`wishlist\` WHERE id=${data.id}`);

            return {
                success: true
            }
            
        } catch (error) {

            return {
                success: false,
                message: error
            }
        }
    }

    async patch(data) {

        try {
            const editData = await db.ExecuteQuery(`UPDATE \`wishlist\` SET title = '${data.title}', price = '${data.price}', favorites = ${data.favorites} WHERE id = ${data.id} AND user_id = ${data.userId}`);
            
            return {
                success: true
            }

        } catch (error) {

            return {
                success: false,
                message: error
            }
        }
    }

    async search(data) {

        try {
            let query = `SELECT * FROM \`wishlist\` WHERE title LIKE '%${data.value}%' AND user_id = ${data.userId}`;

            if(!data.value) {
                query = `SELECT * FROM \`wishlist\` WHERE user_id = ${data.userId}`;  
            }
            const searchData = await db.ExecuteQuery(query);

            return {
                success: true,
                searchData: searchData
            }
        } catch (error) {
            
            return {
                success: false,
                message: error
            }
        }
    }
}

export default WishlistController;