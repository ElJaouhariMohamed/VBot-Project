const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const uri = "mongodb+srv://root:VGn7Yw6G6oG4izic@gomongo.j65hf.mongodb.net/?retryWrites=true&w=majority"

// Defining User schema
const userSchema = new mongoose.Schema({ fname: String, lname: String, email: String, password: String, type: String })

// Defining User model
const User = mongoose.model('User', userSchema);

mongoose.connect(uri).then(
    (con) => {
        console.log('Connection success');
        // Create collection of Model
        User.createCollection().then(function(collection) {
            console.log('Collection is created!');
        });
    }
).catch((err) => {
    console.log(err);
});


//Mettons les middlewares pour traité les formulaires (les données encodés sur le URL):
// create application/json parser
var jsonParser = bodyParser.json();
app.use(jsonParser);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, '/public/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//MongoClient :

//Définition de la route '/' avec la méthode get pour qu'elle envoi la vue principale : 
app.get('/', (req, res) => {
    res.render('index.html');
});

//La route de recuperation des utilisateurs (pour la connexion)
app.post('/getU', (req, res) => {
    console.log(req.body);
    const query = { email: req.body.email };
    User.findOne(query).then((doc) => {
        console.log(doc);
        doc.toJSON();
        if (doc.password==req.body.password){
            console.log('pass')
            res.set('Content-type', 'application/JSON')
            res.send(JSON.stringify(doc)).status(200);  
        }else{
            console.log('wrong pass')
            res.status(500).send();
        }
    }).catch(
        (err) => {
            console.log(err)
            res.status(404).send();
        }
    );
});

//La route d'enregistrement de nouveaux utilisateurs :
app.post('/newU', (req, res) => {
    let nuser = new User(req.body);
    nuser.save().then((err) => {
        if (err) {
            res.send(err).status(500);
        } else {
            res.send(JSON.stringify(nuser)).status(200);
        }
    });
});

//Démarrage du serveur sur le port 8080 : 
app.listen(8080, () => {
    console.log('Serveur entend sur le port 8080...');
});