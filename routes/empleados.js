const express = require('express');
const router = express.Router();
const passport = require('passport');
const empleadoControlador = require('../controllers/empleado');
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

router.get("/", checkAuthenticated, empleadoControlador.panelPrincipalEmpleados);
router.get('/buscar', checkAuthenticated, empleadoControlador.buscarEmpleados);
router.get('/crear', checkAuthenticated, empleadoControlador.cargarPaginaCrearEmpleados);
router.post('/crear', checkAuthenticated, empleadoControlador.crearEmpleado);
router.get('/actualizar/:idEmpleado', checkAuthenticated, empleadoControlador.cargarEmpleadoSeleccionado);
router.put('/actualizar/:idEmpleado', checkAuthenticated, empleadoControlador.actualizarEmpleado);
router.delete('/eliminar/:idEmpleado', checkAuthenticated, empleadoControlador.eliminarEmpleado);

module.exports = router;