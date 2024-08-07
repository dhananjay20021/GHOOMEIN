const expressSession = require('express-session');
const mongoDbStore = require('connect-mongodb-session');

function createSessionStore () {
    const MongoDBStore = mongoDbStore(expressSession);


let mongodbUrl = "mongodb://127.0.0.1:27017";

if(process.env.MONGODB_URL){
  mongodbUrl= process.env.MONGODB_URL;
}

    const store = new MongoDBStore ({
        uri: mongodbUrl,
        databaseName: 'ghoomeinofficial',
        collection: 'sessions'
    })

    return store;
}

function createSessionConfig (){
return{
    secret:'super-secret-ghoomein',
    resave: false,
    saveUninitialized: false,
    store: createSessionStore(),
    cookie: {
        maxAge: 2 * 24 * 60 * 60 * 1000
    }
};
}

module.exports = createSessionConfig; 