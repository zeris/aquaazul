const express = require('express');
const router = express.Router();
const passport = require('passport');
const sql = require('../helpers/databaseManager');

let alertaModulos=false;
let mensajeAlertaModulos="";

router.get('/inicio', function(req,res,next)
{
    res.render('Administrador/inicio', {administrador:req.user})

});

router.get('/usuarios', function(req,res,next)
{
    res.render('Administrador/usuarios', {administrador:req.user, alertaModulos:alertaModulos, mensajeAlertaModulos:mensajeAlertaModulos})
    alertaModulos=false;
    mensajeAlertaModulos="";
});

router.get('/usuarios/crear', function(req,res,next)
{
    res.render('Administrador/crear-usuario', {administrador:req.user})

});

router.post('/usuarios/crear', function(req,res,next)
{
    console.log(req.body);
    var query="insert into usuario (NOMBRE, APELLIDO_P, APELLIDO_M, EMAIL, CONTRASENIA, ADMINISTRADOR) " +
    "values ('" + req.body.nombre + "', '" + req.body.apellidoPaterno + "', '" + req.body.apellidoMaterno + "'," +
    "'" + req.body.email + "', '" + req.body.password + "', 'false')";

    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Usuario Creado";
            res.redirect('./');
        }
        
    })


});



router.get('/productos', function(req,res,next)
{
    res.render('Administrador/productos', {administrador:req.user})

});

router.get('/empleados', function(req,res,next)
{
    res.render('Administrador/empleados', {administrador:req.user})

});

module.exports = router;