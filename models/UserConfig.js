const mongoose = require('mongoose');

const UserConfig = new mongoose.Schema({
    accessKey: {
        type: String,
        required: true
    },
    tipoFollow :{
        type: String,
        required: false
    },
    followRank :{
        type: String,
        required: false
    },
    followId :{
        type: String,
        required: false
    },
    blockId :{
        type: String,
        required: false
    },
    tipoGerenciamento :{
        type: String,
        required: false
    },
    valorEntrada :{
        type: String,
        required: false
    },
    qtdMartingales :{
        type: String,
        required: false
    },
    valorStopWin :{
        type: String,
        required: false
    },
    valorStopLoss :{
        type: String,
        required: false
    },
    valorMinimoTrader :{
        type: String,
        required: false
    },
    tipoConta :{
        type: String,
        required: false
    },
    tipoOpcoes :{
        type: String,
        required: false
    },
    tipoExpiracao :{
        type: String,
        required: false
    },
    selectedParidades :{
        type: String,
        required: false
    },
},
{
    timestamps: true,
});

mongoose.model('userConfig', UserConfig);