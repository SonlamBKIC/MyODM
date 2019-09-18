class myODM {
    constructor() {

    }

    static async connect() {
        const mongodb = require('mongodb');
        const url = "mongodb://127.0.0.1:27017/";
        const connection = await mongodb.connect(url);
        const db = connection.db("test");
        const res = await db.collection('zipcodes').find({}).limit(5).toArray();
        console.log(res);
        connection.close();
    }
}

module.exports = myODM;