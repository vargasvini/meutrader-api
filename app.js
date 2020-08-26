const express = require('express');
const mongoose = require('mongoose');

require("./models/Users");
const Users = mongoose.model('users');

const app = express();

app.use(express.json());

//mongoose.connect('mongodb://meutrader_admin:ABh0l13rftw#@mongo_meutrader_db:27017/meutrader-api', {
mongoose.connect('mongodb://localhost/meutrader-api', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
    console.log("Conexão com MongoDB realizada com sucesso!");
}).catch((erro) => {
    console.log("Erro: Conexão com MongoDB não foi realizada com sucesso!");
});

app.get("/", (req, res) => {
   Users.find({}).then((users) => {
        return res.json(users);
    }).catch((erro) => {
        return res.status(400).json({
            error: true,
            message: "Nenhum users encontrado!"
        })
    })
});

app.post("/users", (req, res) => {
    const users = Users.create(req.body, (err) => {
        if (err) return res.status(400).json({
            error: true,
            message: "Error: users não foi cadastrado com sucesso!"
        });
    
        return res.status(200).json({
            error: false,
            message: "users cadastrado com sucesso!"
        })
    });
});

app.listen(3000, () =>{
    console.log("Servidor iniciado na porta 3000: http://localhost:3000/");
});