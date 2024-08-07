require("dotenv").config();

const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let database;

let mongodbUrl = "mongodb://127.0.0.1:27017";
//let mongodbUrl = "mongodb+srv://ghoomeinofficial:ghoomein17042023@indianitsolutions.ssvaixp.mongodb.net";

if(process.env.MONGODB_URL){
  mongodbUrl= process.env.MONGODB_URL;
}

async function connectToDatabase() {
  const client = await MongoClient.connect(mongodbUrl);
    // const client = await mailto:mongoclient.connect("mongodb+srv://ghoomeinofficial:ghoomein17042023@indianitsolutions.ssvaixp.mongodb.net");
  //database = client.db("ghoomein");
  database = client.db("ghoomeinofficial");
}

function getDb() {
  if (!database) {
    throw new Error("You must connect first!");
  }

  return database;
}

module.exports = {
  connectToDatabase: connectToDatabase,
  getDb: getDb,
};