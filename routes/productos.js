const express = require('express');
const router = express.Router();
const passport = require('passport');
const productoControlador = require('../controllers/productos');
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

router.get("/", checkAuthenticated, productoControlador.panelPrincipalProductos);
router.get('/buscar', checkAuthenticated, productoControlador.buscarProductos);
router.get('/crear', checkAuthenticated, productoControlador.cargarPaginaCrearProductos);
router.post('/crear', checkAuthenticated, productoControlador.crearProducto);
router.get('/actualizar/:idProducto', checkAuthenticated, productoControlador.cargarProductoSeleccionado);
router.put('/actualizar/:idProducto', checkAuthenticated, productoControlador.actualizarProducto);
router.delete('/eliminar/:idProducto', checkAuthenticated, productoControlador.eliminarProducto);

module.exports = router;