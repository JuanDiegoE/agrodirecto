const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const Schema = mongoose.Schema;
const publicacionSchema = new Schema({
    nombreProducto: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    precio: {
        type: String,
        required: true,
        trim: true
    },
    about: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: Buffer
    },
    agricultor: {
        type: String,
        required: true
    }
});

publicacionSchema.plugin(uniqueValidator);

const Publicacion = mongoose.model('Publicacion', publicacionSchema);

module.exports = Publicacion;