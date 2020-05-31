const express = require('express');
const router = express.Router();
const carritocomprasControlador = require('../controllers/carrito-compras');

function checkAuthenticated(req, res, next) 
{
   if (req.isAuthenticated()) 
   {
     return next();
   }
   res.redirect("/login");
}

router.get("/", checkAuthenticated, function(req, res)
{
   res.redirect('/listaproductos/1');
});
router.get('/carritocompras', checkAuthenticated, carritocomprasControlador.seleccionarProductosCarritoCompras);
router.get('/agregar-a-carrito/:id', checkAuthenticated, carritocomprasControlador.agregarProductoACarritoCompras);
router.get('/eliminar-carrito/:id', checkAuthenticated, carritocomprasControlador.eliminarProductoDeCarritoCompras);
router.get('/finalizarventa', checkAuthenticated, carritocomprasControlador.vaciarCarritoCompras);

module.exports = router;