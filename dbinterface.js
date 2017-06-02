
const mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var recipeDBurl = 'mongodb://localhost:27017/recipes';

var initDB = (url, callback) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        db.createCollection("recipes", function (err, res) {
            if (err) throw err;

            console.log('Successfully initialized database');

            callback(res);
            db.close();
        });

    });
};

var addRecipe = (url, recipe, callback) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        
        // Add the recipe
        db.collection("recipes").insertOne(recipe, function (err, res) {
            if (err) throw err;

            callback(res);
            db.close()
        });

    });

};

var removeRecipe = (url, query, callback) => {

    MongoClient.connect(url, (err, db) => {
        if (err) throw err;

        db.collection("recipes").remove(query, (err, obj) => {
            if (err) throw err;

            callback(obj);
            db.close();
        });

    });
};

var getRecipe = (url, query, callback) => {

    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        
        // Get the recipe
        db.collection("recipes").find(query).toArray((err, result) => {
            if (err) throw err;

            callback(result);
            db.close();
        });

    });
};

var printRecipe = (recipe) => {
    console.log('Name:', recipe.name);
    console.log('Description:', recipe.desc);
};

module.exports = {
    initDB,
    addRecipe,
    removeRecipe,
    getRecipe,
    printRecipe,
    db_url: recipeDBurl
};


