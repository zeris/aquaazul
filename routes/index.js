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
   let productos
   let query = "SELECT TOP 5 * FROM PRODUCTO ORDER BY NEWID()";
   sql.query(query, (productosInicio) =>
   {
      sql.query("SELECT * FROM TIP", (listaTips)=>
      {
         console.log(listaTips.recordset);
         res.render('inicio', { productos: productosInicio.recordset, tips: listaTips.recordset });
      })
   })
  
});

router.get('/tips/:idTip', checkAuthenticated, function(req, res)
{
   sql.query("SELECT * FROM TIP WHERE ID_TIP = " + req.params.idTip, (informacionTip)=>
   {
      res.render('tips', { tip: informacionTip.recordset[0] });
   });
})


//Ya que esta página al terminarse de cargar ya debede de mostrar lista de productos, antes de renderizar la página
//se obtendra la lista de productos para luego pasarle esa lista al archivo ejs
router.get('/listaproductos',checkAuthenticated, function(req, res)
{
   res.redirect('/listaproductos/1');
});

router.get('/listaproductos/:pagina',checkAuthenticated, function(req, res)
{
   let query = "SELECT * FROM " +
   "( "+
      "SELECT ROW_NUMBER() OVER(ORDER BY ID_SKU) NUM, "+
      "* FROM PRODUCTO " +
   ") A " +
   "WHERE NUM > " + 8 * (req.params.pagina - 1) +" AND NUM <= " + 8 * req.params.pagina;
   sql.query(query, (respuestaQuery)=>
   {
      sql.query("SELECT COUNT(*) as 'num' FROM PRODUCTO", (numTotalProductos)=>
      {
         let totalButtonsPagination = numTotalProductos.recordset[0].num / 8;
         let pagina = parseInt(req.params.pagina)
         let loadNextButton = true;

         if((pagina % 2) === 1)
         {
            maxButtonsPagination = (pagina + 2) > totalButtonsPagination ? totalButtonsPagination : pagina + 2; 
            minButtonsPagination = pagina;
         }
         else
         {
            maxButtonsPagination = (pagina + 1) > totalButtonsPagination ? totalButtonsPagination : pagina + 1; ;
            minButtonsPagination = pagina - 1;
         }

         if(pagina === totalButtonsPagination)
         {
            loadNextButton = false;
         }

         respuestaQuery=respuestaQuery.recordset;
         let params = {listaProductos: respuestaQuery, productoAgregado: false, maxButtonsPagination: maxButtonsPagination, minButtonsPagination: minButtonsPagination, currentPage: pagina, loadNextButton: loadNextButton };
         if(productoAgregado)
         {
            params = {listaProductos: respuestaQuery, productoAgregado: true, maxButtonsPagination: maxButtonsPagination, minButtonsPagination: minButtonsPagination, currentPage: pagina, loadNextButton: loadNextButton };
            productoAgregado = false;
         }
         res.render('lista-productos', params);
      })
   });
});

router.get('/carritocompras', function(req, res)
{
   sql.query("SELECT PRODUCTO.ID_SKU, NOMBRE, MARCA, DESCRIPCION, PRECIO FROM CARRITO INNER JOIN PRODUCTO ON CARRITO.ID_SKU = PRODUCTO.ID_SKU WHERE ID_USUARIO="+req.user.ID_USUARIO, function(carrito1)
   {
      let carrito=carrito1.recordset;
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

router.get('/eliminar-carrito/:id', checkAuthenticated, function(req, res)
{
   console.log(req.params.id);
   let query= "DELETE FROM CARRITO WHERE ID_SKU= " + req.params.id  + " AND ID_USUARIO= " + req.user.ID_USUARIO;
   sql.query(query, (respuestaQuery)=>
   {
      console.log(respuestaQuery)
      //productoAgregado = true;
      if(respuestaQuery.rowsAffected > 0)
      {
         res.redirect('/carritocompras');
      }
      
      //sql.query("INSERT INTO CARRITO (ID_SKU, ID_USUARIO) VALUES (" + req.params.id + ", " + req.user.ID_USUARIO + ")")
   });
});



//ZONA DE PROGRAMACIÓN, aquí se debe de poner todo el contenido de programación para cada una de las páginas que
//tengan un procesamiento de base de datos, tiendo como método http "post" em lugar de "get"
router.post('/login', passport.authenticate('local', {
   failureRedirect: "/login",
   failureFlash: true
}),(req,res,next)=>{
   console.log(req.user);
   if(req.user.ADMINISTRADOR == true)
   {
      res.redirect('/administrador/inicio');
   }
   else 
   {
      res.redirect('/inicio');
   }
   
});

module.exports = router;