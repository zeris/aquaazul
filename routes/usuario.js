const express = require('express');
const router = express.Router();
const passport = require('passport');
const usuarioControlador = require('../controllers/usuario');
const sql = require('../helpers/databaseManager');
//const jwt = require('../helpers/jwt');
let productoAgregado = false;

function checkAuthenticated(req, res, next) 
{
   if (req.isAuthenticated()) 
   {
     return next();
   }
   res.redirect("/login");
}

router.get("/", checkAuthenticated, usuarioControlador.panelPrincipalUsuarios);
router.get('/buscar', checkAuthenticated, usuarioControlador.buscarUsuarios);
router.get('/crear', checkAuthenticated, usuarioControlador.cargarPaginaCrearUsuarios);
router.post('/crear', checkAuthenticated, usuarioControlador.crearUsuario);
router.get('/actualizar/:idUsuario', checkAuthenticated, usuarioControlador.cargarUsuarioSeleccionado);
router.put('/actualizar/:idUsuario', checkAuthenticated, usuarioControlador.actualizarUsuario);
router.delete('/eliminar/:idUsuario', checkAuthenticated, usuarioControlador.eliminarUsuario);


module.exports = router;