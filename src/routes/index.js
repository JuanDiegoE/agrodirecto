const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const Usuario = require('../models/usuario');
const Publicacion = require('../models/publicacion');
const dirViews = path.join(__dirname, '../../template/views');
const dirPartials = path.join(__dirname, '../../template/partials');
const bcrypt = require('bcrypt');
const multer = require("multer");
require('./../helpers/helpers');

app.set('view engine', 'hbs');
app.set('views', dirViews);
hbs.registerPartials(dirPartials);

var upload = multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/i)) {
            cb(null, false)
        } else {
            cb(null, true)
        }
    }
});

app.get('/', (req, res) => {
    res.render('main')
});

app.get('/registrar', (req, res) => {
    res.render('registrar')
});

app.post('/registrar', (req, res) => {
    if (req.body.password != req.body.password2) {
        return res.render('registrar', {
            mostrar: `<div class="alert alert-danger">ERROR: Las contraseñas no coinciden.</div>`,
            nombre: req.body.nombre,
            correo: req.body.correo,
            usuario: req.body.usuario
        });
    } else {
        let usuario = new Usuario({
            name: req.body.nombre,
            correo: req.body.correo,
            nickname: req.body.usuario,
            password: bcrypt.hashSync(req.body.password, 10),
            usertype: req.body.tipo,
            address: "",
            avatar: "",
            about: ""
        });
        usuario.save((err, resultado) => {
            if (err) {
                return console.log(err)
            }
            if (!resultado) {
                return res.render('registrar', {
                    mostrar: `<div class="alert alert-danger">ERROR: Ya existe un usuario con esos datos.<br></div>`,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    usuario: usuario.nickname
                });
            }
            res.render('registrar', {
                mostrar: `<div class="alert alert-success">Registro exitoso, ${resultado.name}. Por favor inicie sesión en la página principal.</div>`
            });
        });
    }
});

app.get('/login', (req, res) => {
    res.render('login')
});

app.post('/login', (req, res) => {
    req.session.regenerate((err) => {
        if (err) return console.log(err)
    });
    Usuario.findOne({
        $or: [{ nickname: req.body.correo }, { correo: req.body.correo }]
    }, (err, resultado) => {
        if (err) {
            return console.log(err);
        }
        if (!resultado) {
            return res.render('login', {
                mostrar: `<div class="alert alert-danger">Correo, usuario y/o contraseña incorrecta.</div>`,
                correo: req.body.correo
            });
        }
        if (!bcrypt.compareSync(req.body.password, resultado.password)) {
            return res.render('login', {
                mostrar: `<div class="alert alert-danger">Correo, usuario y/o contraseña incorrecta.</div>`,
                correo: req.body.correo
            });
        }
        req.session.user = resultado.nickname
        if (resultado.usertype == "Agricultor") req.session.agricultor = true
        req.session.navigation = true
        if (resultado.avatar != 0) {
            req.session.avatar = `data:img/png;base64,${resultado.avatar.toString("base64")}`
            Publicacion.find({}, (err, respuesta) => {
                if (err) {
                    return console.log(err)
                }
                return res.render('home', {
                    navigation: req.session.navigation,
                    agricultor: req.session.agricultor,
                    avatar: req.session.avatar,
                    lista: respuesta,
                    user: req.session.user
                })
            });
        } else {
            req.session.avatar = `img/profile.png`
            Publicacion.find({}, (err, respuesta) => {
                if (err) {
                    return console.log(err)
                }
                return res.render('home', {
                    navigation: req.session.navigation,
                    agricultor: req.session.agricultor,
                    avatar: req.session.avatar,
                    lista: respuesta,
                    user: req.session.user
                })
            });
        }

    });
});

app.get('/home', (req, res) => {
    Publicacion.find({}, (err, respuesta) => {
        if (err) {
            return console.log(err)
        }
        res.render('home', {
            navigation: req.session.navigation,
            agricultor: req.session.agricultor,
            avatar: req.session.avatar,
            lista: respuesta,
            user: req.session.user
        })
    });
});

app.post('/home', (req, res) => {
    Publicacion.find({}, (err, respuesta) => {
        if (err) {
            return console.log(err)
        }
        return res.render('home', {
            navigation: req.session.navigation,
            agricultor: req.session.agricultor,
            avatar: req.session.avatar,
            lista: respuesta,
            user: req.session.user
        })
    });
});

app.get('/newPublication', (req, res) => {
    res.render('publicacion', {
        navigation: req.session.navigation,
        agricultor: req.session.agricultor,
        avatar: req.session.avatar,
        image: `img/etiqueta.png`
    })
});

app.post('/newPublication', upload.single("archivo"), (req, res) => {
    let publicacion = new Publicacion({
        nombreProducto: req.body.nombreProducto,
        precio: req.body.precio,
        about: req.body.about,
        image: req.file.buffer,
        agricultor: req.session.user
    });
    publicacion.save((err, resultado) => {
        if (err) {
            return res.render('publicacion', {
                mostrar: `<div class="alert alert-danger"><h3>ERROR: Ya existe una publicación con ese nombre, por favor utilice otro.</h3></div>`,
                navigation: req.session.navigation,
                agricultor: req.session.agricultor,
                avatar: req.session.avatar,
                image: `img/etiqueta.png`,
                nombreProducto: req.body.nombreProducto,
                precio: req.body.precio,
                about: req.body.about
            })
        }
        if (!resultado) {
            return res.render('publicacion', {
                navigation: req.session.navigation,
                agricultor: req.session.agricultor,
                avatar: req.session.avatar,
                mostrar: `<div class="alert alert-danger">ERROR: Verifique los datos por favor.<br></div>`,
                image: `img/etiqueta.png`,
                nombreProducto: req.body.nombreProducto,
                precio: req.body.precio,
                about: req.body.about
            });
        }
        res.render('publicacion', {
            navigation: req.session.navigation,
            agricultor: req.session.agricultor,
            avatar: req.session.avatar,
            mostrar: `<div class="alert alert-success"><h3>Publicación creada exitosamente.</h3></div>`,
            image: `data:img/png;base64,${resultado.image.toString("base64")}`,
            nombreProducto: req.body.nombreProducto,
            precio: req.body.precio,
            about: req.body.about
        });
    });
});

app.post('/deletePublication', (req, res) => {
    Publicacion.findOneAndDelete({ nombreProducto: req.body.eliminar }, (err, respuesta) => {
        if (err) return console.log(err)
        if (!respuesta) return console.log("hola" + req.body.eliminar)
        Publicacion.find({}, (err, respuesta) => {
            if (err) {
                return console.log(err)
            }
            return res.render('home', {
                mostrar: `<div class="alert alert-success"><h3>Publicación eliminada exitosamente.</h3></div>`,
                navigation: req.session.navigation,
                agricultor: req.session.agricultor,
                avatar: req.session.avatar,
                lista: respuesta,
                user: req.session.user
            })
        });
    })
});

app.post('/search', (req, res) => {
    if (req.body.search) {
        Publicacion.find({}, (err, ans) => {
            if (err) return console.log(err)
            if (!ans) {
                return res.render('home', {
                    mostrar: `<div class="alert alert-success"><h3>No se encontraron publicaciones.</h3></div>`,
                    navigation: req.session.navigation,
                    agricultor: req.session.agricultor,
                    ventas: true,
                    avatar: req.session.avatar,
                    lista: ans,
                    user: req.session.user
                })
            }
            let flag = false
            ans2 = ans.slice()
            ans.forEach(publicacion => {
                if (publicacion.nombreProducto.search(new RegExp(req.body.search, "i")) == -1) {
                    ans2.splice(ans2.indexOf(publicacion), 1)
                } else {
                    flag = true
                }
            });
            if (flag) {
                res.render('home', {
                    navigation: req.session.navigation,
                    agricultor: req.session.agricultor,
                    ventas: true,
                    avatar: req.session.avatar,
                    lista: ans2,
                    user: req.session.user
                })
            } else {
                return res.render('home', {
                    mostrar: `<div class="alert alert-danger"><h3>No se encontraron publicaciones con esos parámetros.</h3></div>`,
                    navigation: req.session.navigation,
                    agricultor: req.session.agricultor,
                    ventas: true,
                    avatar: req.session.avatar,
                    lista: ans,
                    user: req.session.user
                })
            }
        })
    } else {
        return res.redirect('home')
    }
})

app.post('/deleteUser', (req, res) => {
    Usuario.findOneAndDelete({ nickname: req.session.user }, (err, respuesta) => {
        if (err) return console.log(err)
        if (!respuesta) return console.log("bug")
        console.log("Found a user and is gonna delete it's publications.")
        Publicacion.find({ agricultor: req.session.user }, (err, ans) => {
            ans.forEach(publicacion => {
                Publicacion.findOneAndDelete({ agricultor: publicacion.agricultor }, (err, respuesta2) => {
                    if (err) return console.log(err)
                    if (!respuesta2) return console.log("Didn't find a thing.")
                    console.log("Found something and deleted it.")
                })

            });
        })
        req.session.destroy((err) => {
            if (err) return console.log(err)
        });
        res.redirect('/');
    })
});

app.post('/editPublication', (req, res) => {
    Publicacion.findOne({ nombreProducto: req.body.editar }, (err, respuesta) => {
        if (err) return console.log(err)
        if (!respuesta) return console.log("hola" + req.body.editar)
        if (err) {
            return console.log(err)
        }
        return res.render('editarpublicacion', {
            navigation: req.session.navigation,
            agricultor: req.session.agricultor,
            avatar: req.session.avatar,
            image: `data:img/png;base64,${respuesta.image.toString("base64")}`,
            nombreProducto: respuesta.nombreProducto,
            precio: respuesta.precio,
            about: respuesta.about
        })
    })
});

app.post('/viewPublication', (req, res) => {
    Publicacion.findOne({ nombreProducto: req.body.ver }, (err, resultado) => {
        Usuario.findOne({ nickname: resultado.agricultor }, (err, reuser) => {
            if (err) console.log(err)
            res.render('verpublicacion', {
                navigation: req.session.navigation,
                agricultor: req.session.agricultor,
                avatar: req.session.avatar,
                image: `data:img/png;base64,${resultado.image.toString("base64")}`,
                about: resultado.about,
                price: resultado.precio,
                nombreProducto: resultado.nombreProducto,
                tel: reuser.tel,
                correo: reuser.correo,
                usuario: reuser.name
            })
        })
    })
});

app.get('/profile', (req, res) => {
    Usuario.findOne({
        $or: [{ nickname: req.session.user }, { correo: req.session.user }]
    }, (err, resultado) => {
        if (err) {
            return console.log(err);
        }
        res.render('profile', {
            navigation: req.session.navigation,
            agricultor: req.session.agricultor,
            avatar: req.session.avatar,
            usuario: resultado.nickname,
            nombre: resultado.name,
            ubicacion: resultado.location,
            correo: resultado.correo,
            tel: resultado.tel,
            about: resultado.about
        })
    });
});

app.post('/updatePublication', upload.single("archivo"), (req, res) => {
    Publicacion.findOne({ nombreProducto: req.body.actualizar }, (err, mainProducto) => {
        console.log(req.body.actualizar)
        if (req.file) {
            Publicacion.findOneAndUpdate({ nombreProducto: req.body.actualizar }, {
                $set: {
                    "image": req.file.buffer,
                    "nombreProducto": req.body.nombreProducto,
                    "precio": req.body.precio,
                    "about": req.body.about
                }
            }, { new: true, runValidators: false, context: 'query' }, (err, resultados) => {
                if (err) {
                    return res.render('editarpublicacion', {
                        mostrar: `<div class="alert alert-danger"><h3>ERROR: Ya existe una publicación con esos datos, por favor verifique.</h3></div>`,
                        navigation: req.session.navigation,
                        agricultor: req.session.agricultor,
                        avatar: req.session.avatar,
                        image: `data:img/png;base64,${mainProducto.image.toString("base64")}`,
                        nombreProducto: mainProducto.nombreProducto,
                        precio: mainProducto.precio,
                        about: mainProducto.about
                    })
                }
                if (!resultados) {
                    return res.render('editarpublicacion', {
                        mostrar: `<div class="alert alert-danger"><h3>Ha ocurrido un error.</h3></div>`,
                        navigation: req.session.navigation,
                        agricultor: req.session.agricultor,
                        avatar: req.session.avatar,
                        image: `data:img/png;base64,${mainProducto.image.toString("base64")}`,
                        nombreProducto: mainProducto.nombreProducto,
                        precio: mainProducto.precio,
                        about: mainProducto.about
                    })
                }
                res.render('editarpublicacion', {
                    mostrar: `<div class="alert alert-success"><h3>Datos actualizados exitosamente.</h3></div>`,
                    navigation: req.session.navigation,
                    agricultor: req.session.agricultor,
                    avatar: req.session.avatar,
                    image: `data:img/png;base64,${resultados.image.toString("base64")}`,
                    nombreProducto: resultados.nombreProducto,
                    precio: resultados.precio,
                    about: resultados.about
                })
            })
        } else {
            Publicacion.findOneAndUpdate({ nombreProducto: req.body.actualizar }, {
                $set: {
                    "nombreProducto": req.body.nombreProducto,
                    "precio": req.body.precio,
                    "about": req.body.about
                }
            }, { new: true, runValidators: false, context: 'query' }, (err, resultados) => {
                if (err) {
                    return res.render('editarpublicacion', {
                        mostrar: `<div class="alert alert-danger"><h3>ERROR: Ya existe una publicación con esos datos, por favor verifique.</h3></div>`,
                        navigation: req.session.navigation,
                        agricultor: req.session.agricultor,
                        avatar: req.session.avatar,
                        image: `data:img/png;base64,${mainProducto.image.toString("base64")}`,
                        nombreProducto: mainProducto.nombreProducto,
                        precio: mainProducto.precio,
                        about: mainProducto.about
                    })
                }
                if (!resultados) {
                    return res.render('editarpublicacion', {
                        mostrar: `<div class="alert alert-danger"><h3>Ha ocurrido un error.</h3></div>`,
                        navigation: req.session.navigation,
                        agricultor: req.session.agricultor,
                        avatar: req.session.avatar,
                        image: `data:img/png;base64,${mainProducto.image.toString("base64")}`,
                        nombreProducto: mainProducto.nombreProducto,
                        precio: mainProducto.precio,
                        about: mainProducto.about
                    })
                }
                res.render('editarpublicacion', {
                    mostrar: `<div class="alert alert-success"><h3>Datos actualizados exitosamente.</h3></div>`,
                    navigation: req.session.navigation,
                    agricultor: req.session.agricultor,
                    avatar: req.session.avatar,
                    image: `data:img/png;base64,${resultados.image.toString("base64")}`,
                    nombreProducto: resultados.nombreProducto,
                    precio: resultados.precio,
                    about: resultados.about
                })
            })
        }
    })
})

app.post('/profile', upload.single("archivo"), (req, res) => {
    Usuario.findOne({
        $or: [{ nickname: req.session.user }, { correo: req.session.user }]
    }, (err, mainUser) => {
        if (req.file) {
            Usuario.findOneAndUpdate({
                $or: [{ nickname: req.session.user }, { correo: req.session.user }]
            }, {
                $set: {
                    "avatar": req.file.buffer,
                    "nickname": req.body.usuario,
                    "name": req.body.nombre,
                    "location": req.body.ubicacion,
                    "correo": req.body.correo,
                    "tel": req.body.tel,
                    "about": req.body.about
                }
            }, { new: true, runValidators: false, context: 'query' }, (err, resultados) => {
                if (err) {
                    return res.render('profile', {
                        mostrar: `<div class="alert alert-danger"><h3>ERROR: Ya existe un usuario con esos datos, por favor verifique.</h3></div>`,
                        navigation: req.session.navigation,
                        agricultor: req.session.agricultor,
                        avatar: req.session.avatar,
                        usuario: mainUser.nickname,
                        nombre: mainUser.name,
                        ubicacion: mainUser.location,
                        correo: mainUser.correo,
                        tel: mainUser.tel,
                        about: mainUser.about
                    })
                }
                if (!resultados) {
                    return res.render('profile', {
                        mostrar: `<div class="alert alert-danger"><h3>Ha ocurrido un error.</h3></div>`,
                        navigation: req.session.navigation,
                        agricultor: req.session.agricultor,
                        avatar: req.session.avatar,
                        usuario: mainUser.nickname,
                        nombre: mainUser.name,
                        ubicacion: mainUser.location,
                        correo: mainUser.correo,
                        tel: mainUser.tel,
                        about: mainUser.about
                    })
                }
                Usuario.findOne({ $or: [{ nickname: req.body.nickname }, { correo: req.body.correo }] }, (err, resultados2) => {
                    if (err) {
                        return console.log(err);
                    }
                    req.session.avatar = `data:img/png;base64,${resultados2.avatar.toString("base64")}`
                    req.session.user = resultados2.nickname
                    res.render('profile', {
                        mostrar: `<div class="alert alert-success"><h3>Datos actualizados exitosamente.</h3></div>`,
                        navigation: req.session.navigation,
                        agricultor: req.session.agricultor,
                        avatar: req.session.avatar,
                        usuario: resultados2.nickname,
                        nombre: resultados2.name,
                        ubicacion: resultados2.location,
                        correo: resultados2.correo,
                        tel: resultados2.tel,
                        about: resultados2.about
                    })
                })
            })
        } else {
            Usuario.findOneAndUpdate({
                $or: [{ nickname: req.session.user }, { correo: req.session.user }]
            }, {
                $set: {
                    "nickname": req.body.usuario,
                    "name": req.body.nombre,
                    "location": req.body.ubicacion,
                    "correo": req.body.correo,
                    "tel": req.body.tel,
                    "about": req.body.about
                }
            }, { new: true, runValidators: false, context: 'query' }, (err, resultados) => {
                if (err) {
                    return res.render('profile', {
                        mostrar: `<div class="alert alert-danger"><h3>ERROR: Ya existe un usuario con esos datos, por favor verifique.</h3></div>`,
                        navigation: req.session.navigation,
                        agricultor: req.session.agricultor,
                        avatar: req.session.avatar,
                        usuario: mainUser.nickname,
                        nombre: mainUser.name,
                        ubicacion: mainUser.location,
                        correo: mainUser.correo,
                        tel: mainUser.tel,
                        about: mainUser.about
                    })
                }
                if (!resultados) {
                    return res.render('profile', {
                        mostrar: `<div class="alert alert-danger"><h3>Ha ocurrido un error.</h3></div>`,
                        navigation: req.session.navigation,
                        agricultor: req.session.agricultor,
                        avatar: req.session.avatar,
                        usuario: mainUser.nickname,
                        nombre: mainUser.name,
                        ubicacion: mainUser.location,
                        correo: mainUser.correo,
                        tel: mainUser.tel,
                        about: mainUser.about
                    })
                }
                req.session.user = resultados.nickname
                res.render('profile', {
                    mostrar: `<div class="alert alert-success"><h3>Datos actualizados exitosamente.</h3></div>`,
                    navigation: req.session.navigation,
                    agricultor: req.session.agricultor,
                    avatar: req.session.avatar,
                    usuario: resultados.nickname,
                    nombre: resultados.name,
                    ubicacion: resultados.location,
                    correo: resultados.correo,
                    tel: resultados.tel,
                    about: resultados.about
                })
            })
        }
    });
});

app.get('/salir', (req, res) => {
    req.session.destroy((err) => {
        if (err) return console.log(err)
    });
    res.redirect('/');
})

app.get('*', (req, res) => {
    res.render('error', {
        titulo: "Error 404",
    })
});

module.exports = app;