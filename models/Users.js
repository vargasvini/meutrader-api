const mongoose = require('mongoose');

const Users = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    acessoKey: {
        type: String,
        required: true
    }
},
{
    timestamps: true,
});

mongoose.model('users', Users);