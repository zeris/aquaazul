const express = require('express');
const router = express.Router();
const passport = require('passport');
const sql = require('../helpers/databaseManager');
//const jwt = require('../helpers/jwt');
let productoAgregado = false;
function checkAuthenticated(req, res, next) {
   if (req.isAuthenticated()) 
   {
     return next();
   }
   res.redirect("/login");
 }
//ZONA DE RUTAS, aquí se debe el nombre del archivo .ejs (el cual contiene el html) y la ruta en la que se
//desea mostrar dicha página web.
router.get('/', function(req, res)
{
   res.redirect('login')
});

router.get('/login', function(req, res)
{
   
   res.render('login');
});

router.get('/inicio', checkAuthenticated, function(req, res)
{
   res.render('inicio');
});

//Ya que esta página al terminarse de cargar ya debede de mostrar lista de productos, antes de renderizar la página
//se obtendra la lista de productos para luego pasarle esa lista al archivo ejs
router.get('/listaproductos',checkAuthenticated, function(req, res)
{
   sql.query("SELECT * FROM producto", (respuestaQuery)=>
   {
      let params = {listaProductos: respuestaQuery, productoAgregado: false };
      if(productoAgregado)
      {
         params = {listaProductos: respuestaQuery, productoAgregado: true };
         productoAgregado = false;
      }
      res.render('lista-productos', params);
   });
});

router.get('/carritocompras', function(req, res)
{
   sql.query("SELECT PRODUCTO.ID_SKU, NOMBRE, MARCA, DESCRIPCION, PRECIO FROM CARRITO INNER JOIN PRODUCTO ON CARRITO.ID_SKU = PRODUCTO.ID_SKU WHERE ID_USUARIO="+req.user.ID_USUARIO, function(carrito)
   {
      console.log(carrito);
      var totalCompra=0;
      for(const prodCarrito of carrito)
      {
         totalCompra+= prodCarrito.PRECIO;
      }
      console.log(totalCompra);
      res.render('carrito-compras', {carritoCompras:carrito, totalCompra:totalCompra});
   });
   
});

router.get('/agregar-a-carrito/:id', checkAuthenticated, function(req, res)
{
   console.log(req.params.id);
   let query = "IF (SELECT COUNT(*) FROM CARRITO WHERE ID_SKU = " + req.params.id + " AND ID_USUARIO = " + req.user.ID_USUARIO + ") = 1 " +
   "BEGIN " +
      "UPDATE CARRITO SET CANTIDAD = CANTIDAD + 1 WHERE  ID_SKU = " + req.params.id + " AND ID_USUARIO = " + req.user.ID_USUARIO + " " +
   "END " +
   "ELSE " +
   "BEGIN " +
      "INSERT INTO CARRITO (ID_SKU, ID_USUARIO, CANTIDAD) VALUES (" + req.params.id + ", " + req.user.ID_USUARIO + ", 1) " +
   "END";
   sql.query(query, (respuestaQuery)=>
   {
      productoAgregado = true;
      res.redirect('../listaproductos');
      //sql.query("INSERT INTO CARRITO (ID_SKU, ID_USUARIO) VALUES (" + req.params.id + ", " + req.user.ID_USUARIO + ")")
   });
});

//ZONA DE PROGRAMACIÓN, aquí se debe de poner todo el contenido de programación para cada una de las páginas que
//tengan un procesamiento de base de datos, tiendo como método http "post" em lugar de "get"
router.post('/login', passport.authenticate('local',{
   successRedirect: "/inicio",
   failureRedirect: "/login",
   failureFlash: true
}));

module.exports = router;