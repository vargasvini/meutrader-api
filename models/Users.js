const mongoose = require('mongoose');

const Users = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    accessKey: {
        type: String,
        required: true
    },
    isActive:{
        type: Boolean,
        required: true
    },
    expireDate:{
        type: Date,
        required: true
    }
},
{
    timestamps: true,
});

mongoose.model('users', Users);