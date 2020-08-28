const mongoose = require('mongoose');

const Trades = new mongoose.Schema({
    traderId: {
        type: String,
        required: true
    },
    resultado: {
        type: String,
        required: true
    },
    paridade:{
        type: String,
        required: true
    },
    valor:{
        type: Number,
        required: true
    },
    operacao:{
        type: String,
        required: true
    },
    nome:{
        type: String,
        required: true
    },
    timeframe:{
        type: String,
        required: true
    },
    data:{
        type: String,
        required: true
    },
    operationId:{
        type: String,
        required: true
    },
    userId:{
        type: String,
        required: true
    },
    userKey:{
        type: String,
        required: true
    }
},
{
    timestamps: true,
});

mongoose.model('trades', Trades);