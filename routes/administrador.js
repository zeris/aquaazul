const express = require('express');
const router = express.Router();
const passport = require('passport');
const sql = require('../helpers/databaseManager');

let alertaModulos=false;
let mensajeAlertaModulos="";

let busqueda=false;
let resultadosBusqueda=null;

router.get('/inicio', function(req,res,next)
{
    res.render('Administrador/inicio', {administrador:req.user})
});

router.get('/usuarios', function(req,res,next)
{
    res.render('Administrador/usuarios', {administrador:req.user, alertaModulos:alertaModulos, mensajeAlertaModulos:mensajeAlertaModulos, busqueda:busqueda, resultadosBusqueda:resultadosBusqueda})
    alertaModulos=false;
    mensajeAlertaModulos="";
    busqueda=false;
    resultadosBusqueda=null;
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

router.get('/usuarios/actualizar/:idUsuario', function(req,res,next)
{
    let query= "select * from usuario where ID_USUARIO = " + req.params.idUsuario;
    sql.query(query, (respuestaQuery)=>
    {

        res.render('Administrador/actualizar-usuario', { usuario:respuestaQuery.recordset[0] });
    })
});

router.post('/usuarios/actualizar/:idUsuario', function(req,res,next)
{
    let query= "UPDATE USUARIO SET NOMBRE = '" + req.body.nombre + "', APELLIDO_P = '" + req.body.apellidoPaterno + "', " +
    "APELLIDO_M = '" + req.body.apellidoMaterno + "', EMAIL = '" + req.body.email + "' WHERE ADMINISTRADOR = 'false' and ID_USUARIO = " + req.params.idUsuario;
    
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Usuario Actualizado";
            res.redirect('/administrador/usuarios');
        }
        
    })
});

router.get('/usuarios/eliminar/:idUsuario', function(req,res,next)
{
    let query= "delete from usuario where ADMINISTRADOR = 'false' and ID_USUARIO = " + req.params.idUsuario;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Usuario Eliminado";
            res.redirect('/administrador/usuarios');
        }        
    })
});

router.get('/usuarios/buscar', function(req,res,next)
{
    //res.render('Administrador/productos', {administrador:req.user})
    let query= "select * from usuario where ADMINISTRADOR = 'false' and NOMBRE like '%" + req.query.nombreBuscar + "%'";
    sql.query(query, (respuestaQuery)=>
    {
        busqueda=true;
        resultadosBusqueda=respuestaQuery.recordset;
        res.redirect('./')
    })
});

router.get('/productos', function(req,res,next)
{
    res.render('Administrador/productos', {administrador:req.user})

});

router.get('/empleados', function(req,res,next)
{
    res.render('Administrador/empleados', {administrador:req.user, alertaModulos:alertaModulos, mensajeAlertaModulos:mensajeAlertaModulos, busqueda:busqueda, resultadosBusqueda:resultadosBusqueda})
    alertaModulos=false;
    mensajeAlertaModulos="";
    busqueda=false;
    resultadosBusqueda=null;
});

router.get('/empleados/crear', function(req,res,next)
{
    res.render('Administrador/crear-empleado', {administrador:req.user})
});

router.post('/empleados/crear', function(req,res,next)
{
    console.log(req.body);
    var query="insert into usuario (NOMBRE, APELLIDO_P, APELLIDO_M, EMAIL, CONTRASENIA, ADMINISTRADOR) " +
    "values ('" + req.body.nombre + "', '" + req.body.apellidoPaterno + "', '" + req.body.apellidoMaterno + "'," +
    "'" + req.body.email + "', '" + req.body.password + "', 'true')";

    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Empleado Creado";
            res.redirect('./');
        }
        
    })
});

router.get('/empleados/actualizar/:idEmpleado', function(req,res,next)
{
    let query= "select * from usuario where ADMINISTRADOR = 'true' and ID_USUARIO = " + req.params.idEmpleado;
    sql.query(query, (respuestaQuery)=>
    {

        res.render('Administrador/actualizar-empleado', { empleado:respuestaQuery.recordset[0] });
    })
});

router.post('/empleados/actualizar/:idEmpleado', function(req,res,next)
{
    let query= "UPDATE USUARIO SET NOMBRE = '" + req.body.nombre + "', APELLIDO_P = '" + req.body.apellidoPaterno + "', " +
    "APELLIDO_M = '" + req.body.apellidoMaterno + "', EMAIL = '" + req.body.email + "' WHERE ADMINISTRADOR = 'true' and ID_USUARIO = " + req.params.idEmpleado;
    
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Empleado Actualizado";
            res.redirect('/administrador/empleados');
        }       
    })
});

router.get('/empleados/eliminar/:idEmpleado', function(req,res,next)
{
    let query= "delete from usuario where ADMINISTRADOR = 'true' and ID_USUARIO = " + req.params.idEmpleado;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Empleado Eliminado";
            res.redirect('/administrador/empleados');
        }        
    })
});

router.get('/empleados/buscar', function(req,res,next)
{
    //res.render('Administrador/productos', {administrador:req.user})
    let query= "select * from usuario where ADMINISTRADOR = 'true' and NOMBRE like '%" + req.query.nombreBuscar + "%'";
    sql.query(query, (respuestaQuery)=>
    {
        busqueda=true;
        resultadosBusqueda=respuestaQuery.recordset;
        res.redirect('./')
    })
});

module.exports = router;