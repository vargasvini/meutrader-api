const express = require('express');
const mongoose = require('mongoose');

require("./models/Users");
const Users = mongoose.model('users');

require("./models/Trades");
const Trades = mongoose.model('trades');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect('mongodb://meutrader_admin:ABh0l13rftw#@mongo_meutrader_db:27017/meutrader_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
    console.log("Conexão com MongoDB realizada com sucesso!");
}).catch((erro) => {
    console.log("Erro: Conexão com MongoDB não foi realizada com sucesso!");
});


app.get("/", (req, res) => {
    res.send("BEM VINDO AO MEU TRADER!")
});

app.get("/deleteAll", (req, res) => {
    Users.deleteMany({}).then(function(){ 
        return res.json("TODOS OS USUÁRIOS DELETADOS"); // Success 
    }).catch(function(error){ 
        return res.json(error); // Failure 
    }); 
});

app.get("/getUsers", (req, res) => {
   Users.find({}).then((users) => {
        return res.json(users);
    }).catch((erro) => {
        return res.status(400).json({
            error: true,
            message: "Nenhum users encontrado!"
        })
    })
});

app.get('/cad-user', function(req, res){
    new Users({
        nome: "teste",
        accessKey: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        isActive: true
    }).save().then(() => {
        res.send("Cadastro realizado com sucesso")
    }).catch((erro) => {
        res.send("ERRO "+erro)
    })
})

app.post("/postUser", (req, res) => {
    const data = req.body;
    const usersCad = new Users(data);
    usersCad.save((error) => {
        if(error){            
            res.status(500).json({msg: 'NÃO ROLOU'})
            return;
        }
        return res.json({msg:"USUÁRIO CADASTRADOOOO"})
    });
});

app.get("/getTrades", (req, res) => {
    Trades.find({}).then((trades) => {
        return res.json(trades);
     }).catch((erro) => {
        return res.status(400).json({
            error: true,
            message: "Nenhum trade encontrado!"
        })
     })
 });

app.post("/postTrades", (req, res) => {
    const data = req.body;
    const trades = new Trades(data);
    trades.save((error) => {
        if(error){
            console.log(error)
            res.status(500).json({msg: 'NÃO ROLOU'})
            return;
        }
        return res.json({msg:"TRADE CADASTRADOOOO"})
    });
});


app.get("/deleteAllTrades", (req, res) => {
    Trades.deleteMany({}).then(function(){ 
        return res.json("TODOS OS TRADES DELETADOS"); // Success 
    }).catch(function(error){ 
        return res.json(error); // Failure 
    }); 
});

app.get("/getAggregatedTrades", (req, res) => {
    Trades.aggregate(
        [
            { $sort : { saldo: -1 } },
            { $limit: 100 },
            { $group: {
                _id: {traderId: "$traderId", nome: "$nome"},
                trade: {$push: {
                    saldo: { 
                        "$sum": {"$cond": [{ "$eq": ["$resultado", "WIN"] }, 1, -1]}
                    },
                    qtdWin: {
                        "$sum": {"$cond": [{ "$eq": ["$resultado", "WIN"] }, 1, 0]}
                    },
                    qtdLoss: {
                        "$sum": {"$cond": [{ "$eq": ["$resultado", "LOSS"] }, 1, 0]}
                    },
                    saldoValor: {
                        "$sum": {"$cond": [{ "$eq": ["$resultado", "WIN"] }, "$valor", "-$valor"]}
                    }
                }}                
            }},
            { $unwind: {path: '$trade',  includeArrayIndex: 'rownum'}},
            { $project: {
                saldo: '$trade.saldo',
                qtdWin: '$trade.qtdWin',
                qtdLoss: '$trade.qtdLoss',
                saldoValor: '$trade.saldoValor',
                rownum: 1
            }}
        ]
    ).then((trades) => {
        return res.json(trades);
     }).catch((erro) => {
        return res.status(400).json({
            error: true,
            message: "Nenhum trade encontrado!"
        })
     })
 });

app.listen(3000, () =>{
    console.log("Servidor iniciado na porta 3000: http://localhost:3000/");
});