const express = require('express');
const router = express.Router();
const passport = require('passport');
const sql = require('../helpers/databaseManager');

router.get('/inicio', function(req,res,next)
{
    res.render('Administrador/inicio', {administrador:req.user})

});

router.get('/usuarios', function(req,res,next)
{
    res.render('Administrador/usuarios', {administrador:req.user})

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