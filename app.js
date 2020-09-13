const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
var schedule = require('node-schedule');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./setup/auth')
const { v4: uuidv4 } = require('uuid');

process.env.NODE_ENV = 'production';

function requireHTTPS(req, res, next) {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
      return res.redirect('https://' + req.get('Host') + req.url);
    }
    next();
}

function generateToken(params = {}){
    return jwt.sign(params, process.env.TOKEN_SECRET)
}

async function generateKey(){
    var generatedKey = uuidv4()
    const user = await Users.findOne({ accessKey: uuidv4() })
        
    if(user){
        generateKey();
    }else{
        return generatedKey;
    }
}

require("./models/Users");
const Users = mongoose.model('users');

require("./models/Trades");
const Trades = mongoose.model('trades');

require("./models/UserConfig");
const UserConfig = mongoose.model('userConfig');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requireHTTPS);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).then(() => {
    console.log("Conexão com MongoDB realizada com sucesso!");
}).catch((erro) => {
    console.log("Erro: Conexão com MongoDB não foi realizada com sucesso!");
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.get("/tutorial", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/Tutorial.html'));
});

app.get("/nicepagecss", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/nicepage.css'));
});
app.get("/meutradercss", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/MeuTrader.css'));
});
app.get("/jquery", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/jquery.js'));
});
app.get("/nicepagejs", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/nicepage.js'));
});
app.get("/banner", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/images/banner-meu-trader-home.png'));
});


app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: /api/\nDisallow: /tutorial");
});

app.post('/api/authenticate', async (req, res) =>{
    const accessKey = req.body.accessKey;
    const user = await Users.findOne({accessKey, isActive: true})

    if(!user)
        return res.status(400).send({error: 'User not found'})

    res.send({user, token: generateToken({ id: user.id })})
});

app.get("/api/getUsers", authMiddleware, (req, res) => {
    Users.find({}).then((users) => {
         return res.json(users);
     }).catch((erro) => {
         return res.status(400).json({
             error: true,
             message: "Nenhum users encontrado!"
         })
     })
 });

app.post("/api/postUser", authMiddleware, (req, res) => {
    var key = "";
    var dateToExpire = new Date()
    dateToExpire.setMonth(dateToExpire.getMonth()+1)
    generateKey().then((response)=> {
        key = response
        new Users({
            nome: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            accessKey: key,
            isActive: true,
            expireDate: dateToExpire
        }).save().then(() => {
            res.send("Cadastro realizado com sucesso")
        }).catch((erro) => {
            return res.status(400).send({error: 'User cannot be created'})
        })
    })
});

app.get("/api/deleteAllUsers", authMiddleware, (req, res) => {
    Users.deleteMany({}).then(function(){ 
        return res.json("TODOS OS USUÁRIOS DELETADOS"); // Success 
    }).catch(function(error){ 
        return res.json(error); // Failure 
    }); 
});

app.get("/api/getTrades", authMiddleware, (req, res) => {
    Trades.find({}).then((trades) => {
        return res.json(trades);
     }).catch((erro) => {
        return res.status(400).json({
            error: true,
            message: "Nenhum trade encontrado!"
        })
     })
});

app.post("/api/postTrades", authMiddleware, (req, res) => {
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

// app.get("/api/deleteAllTrades", (req, res) => {
//     Trades.deleteMany({}).then(function(){ 
//         return res.json("TODOS OS TRADES DELETADOS"); // Success 
//     }).catch(function(error){ 
//         return res.json(error); // Failure 
//     }); 
// });

app.get("/api/getAggregatedTrades", authMiddleware, (req, res) => {
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

// app.get("/getAllUsersConfigs", (req, res) => {
//     const data = req.body;
//     UserConfig.find({ }).then((userConfig) => {
//         return res.json(userConfig);
//      }).catch((erro) => {
//         return res.status(400).json({
//             error: true,
//             message: "Nenhuma configuração encontrada para este usuário!"
//         })
//      })
// });

app.get("/api/getUserConfig/:key", authMiddleware, (req, res) => {
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

app.post("/api/postUserConfig", authMiddleware, (req, res) => {
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

app.get("/api/deleteAllUsersConfigs", authMiddleware, (req, res) => {
    UserConfig.deleteMany({}).then(function(){ 
        return res.json("TODOS AS CONFIGS DELETADAS"); // Success 
    }).catch(function(error){ 
        return res.json(error); // Failure 
    }); 
});

app.get("/api/verifyExpiredUsers", (req, res) => {
    var j = schedule.scheduleJob({hour: 12, minute: 00}, function(){
        var date = new Date()
        console.log('Iniciando Job de usuários expirados');

        Users.updateMany({expireDate: {$lt: date}}, {isActive: false}, (error)=>{
            if(error){
                console.log(error)
                return;
            }
            return console.log('Verificação de usuários expirados realizada com sucesso')
        });
    });
});

app.listen(3000, () =>{
    console.log("Servidor iniciado na porta 3000: https://localhost:8080/");
});