const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
var schedule = require('node-schedule');

require("./models/Users");
const Users = mongoose.model('users');

require("./models/Trades");
const Trades = mongoose.model('trades');

require("./models/UserConfig");
const UserConfig = mongoose.model('userConfig');

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
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.get("/nicepagecss", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/nicepage.css'));
});
app.get("/pagina1", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/Página-1.css'));
});
app.get("/jquery", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/jquery.js'));
});
app.get("/nicepagejs", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/nicepage.js'));
});
app.get("/icon", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/images/icon.jpeg'));
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
    var dateToExpire = new Date()
    //dateToExpire.setMonth(dateToExpire.getMonth()+1)
    dateToExpire.setMinutes(dateToExpire.getMinutes()+2)
    new Users({
        nome: "teste",
        accessKey: "999deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        isActive: true,
        expireDate: dateToExpire
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

            { $group: {
                _id: {traderId: "$traderId", nome: "$nome", flag: "$flag"},
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
            }},
            { $sort : { saldo: -1 } },
            { $limit: 100 }
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

app.get("/getAllUsersConfigs", (req, res) => {
    const data = req.body;
    UserConfig.find({ }).then((userConfig) => {
        return res.json(userConfig);
     }).catch((erro) => {
        return res.status(400).json({
            error: true,
            message: "Nenhuma configuração encontrada para este usuário!"
        })
     })
});

app.get("/getUserConfig/:key", (req, res) => {
    UserConfig.find({ accessKey: req.params.key })
    .then((userConfig) => {
        if(!userConfig) { return res.status(404).end(); }
        return res.status(200).json(userConfig);
    }).catch((erro) => {
        return res.status(400).json({
            error: true,
            message: "Nenhuma configuração encontrada para este usuário!"
        })
    })
});

app.post("/postUserConfig", (req, res) => {
    const data = req.body;
    var query = { accessKey: data.accessKey },
    update ={
        accessKey: data.accessKey,
        tipoFollow: data.tipoFollow,
        followRank: data.followRank,
        followId: data.followId,
        blockId: data.blockId,
        tipoGerenciamento: data.tipoGerenciamento,
        valorEntrada: data.valorEntrada,
        qtdMartingales: data.qtdMartingales,
        valorStopWin: data.valorStopWin,
        valorStopLoss: data.valorStopLoss,
        valorMinimoTrader: data.valorMinimoTrader,
        tipoConta: data.tipoConta,
        tipoOpcoes: data.tipoOpcoes,
        tipoExpiracao: data.tipoExpiracao,
        selectedParidades: data.selectedParidades
    },
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

    UserConfig.findOneAndUpdate(query, update, options, (error)=>{
        if(error){
            console.log(error)
            res.status(500).json({msg: 'NÃO ROLOU'})
            return;
        }
        return res.json({msg:"TRADE CADASTRADOOOO"})
    });
});

app.get("/deleteAllUsersConfigs", (req, res) => {
    UserConfig.deleteMany({}).then(function(){ 
        return res.json("TODOS AS CONFIGS DELETADAS"); // Success 
    }).catch(function(error){ 
        return res.json(error); // Failure 
    }); 
});

app.get("/verifyExpiredUsers", (req, res) => {
    var j = schedule.scheduleJob('*/1 * * * *', function(){
        var date = new Date()
        console.log('Iniciando Job de usuários expirados');

        Users.updateMany({expireDate: {$lt: date}}, {isActive: false}, (error)=>{
            if(error){
                console.log(error)
                return;
            }
            return console.log('ROLOU')
        });
    });
});


app.listen(3000, () =>{
    console.log("Servidor iniciado na porta 3000: http://localhost:3000/");
});