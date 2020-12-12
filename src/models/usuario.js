const { unique } = require('jquery');
const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const Schema = mongoose.Schema;
const usuarioSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    nickname: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    usertype: {
        type: String,
        required: true
    },
    location: {
        type: String,
        trim: true
    },
    avatar: {
        type: Buffer
    },
    tel: {
        type: String
    },
    about: {
        type: String,
        trim: true
    }
});

usuarioSchema.plugin(uniqueValidator);

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;