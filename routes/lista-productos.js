const express = require('express');
const router = express.Router();
const listaproductosControlador = require('../controllers/lista-productos');

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
router.get('/:pagina', checkAuthenticated, listaproductosControlador.obtenerProductosPagina);
router.get('/buscar', checkAuthenticated, listaproductosControlador.buscarProductos);

module.exports = router;