const express = require('express');
const router = express.Router();
const passport = require('passport');
const sql = require('../helpers/databaseManager');
//const jwt = require('../helpers/jwt');
let productoAgregado = false;
let errorAgregarProducto = false;

function checkAuthenticated(req, res, next) {
   if (req.isAuthenticated()) 
   {
      if(req.user.ADMINISTRADOR === true)
      {
         res.redirect('/administrador/inicio');
      }

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
   let errors = req.flash().error || [];
   console.log(errors);
   res.render('login', { errors });
});

router.post('/login', passport.authenticate('local', {
   failureFlash: true,
   failureRedirect: "/login"
}),(req,res,next)=>{
   if(req.user.ADMINISTRADOR == true)
   {
      res.redirect('/administrador/inicio');
   }
   else 
   {
      res.redirect('/inicio');
   }
   
});

router.get('/inicio', checkAuthenticated, function(req, res)
{
   let productos
   let query = "SELECT TOP 5 * FROM PRODUCTO ORDER BY NEWID()";
   sql.query(query, (productosInicio) =>
   {
      sql.query("SELECT * FROM TIP", (listaTips)=>
      {
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

router.get('/listaproductos/buscar',checkAuthenticated, function(req, res)
{
   let query= "select * from producto where NOMBRE like '%" + req.query.nombreBuscar + "%' AND CANTIDAD > 0";
   sql.query(query, (respuestaQuery)=>
   {
      let resultadosBusqueda=respuestaQuery.recordset;
      let params = {listaProductos: resultadosBusqueda, productoAgregado: false, busqueda: true, errorAgregarProducto: false};
         
      res.render('lista-productos', params);
   })
});

router.get('/listaproductos/:pagina',checkAuthenticated, function(req, res)
{
   let query = "SELECT * FROM " +
   "( "+
      "SELECT ROW_NUMBER() OVER(ORDER BY ID_SKU) NUM, "+
      "* FROM PRODUCTO WHERE CANTIDAD > 0 " +
   ") A " +
   "WHERE NUM > " + 8 * (req.params.pagina - 1) +" AND NUM <= " + 8 * req.params.pagina;
   sql.query(query, (respuestaQuery)=>
   {
      sql.query("SELECT COUNT(*) as 'num' FROM PRODUCTO", (numTotalProductos)=>
      {
         let totalButtonsPagination = numTotalProductos.recordset[0].num / 8;
         if((totalButtonsPagination + "").split(".")[1] > 0)
         {
            totalButtonsPagination = parseInt(totalButtonsPagination) + 1;
         }
         else
         {
            totalButtonsPagination = parseInt(totalButtonsPagination);  
         }

         let pagina = parseInt(req.params.pagina)
         let loadNextButton = true;

         maxButtonsPagination =  pagina === 1 ? pagina + 2 : pagina + 1;
         minButtonsPagination = pagina === 1 ? pagina : pagina - 1;

         if(pagina === totalButtonsPagination)
         {
            loadNextButton = false;
         }
         respuestaQuery=respuestaQuery.recordset;
         let params = {listaProductos: respuestaQuery, errorAgregarProducto:false, productoAgregado: false, maxButtonsPagination: maxButtonsPagination, minButtonsPagination: minButtonsPagination, currentPage: pagina, loadNextButton: loadNextButton, busqueda: false, totalButtonsPagination: totalButtonsPagination };
         if(productoAgregado)
         {
            params = {listaProductos: respuestaQuery, errorAgregarProducto:false, productoAgregado: true, maxButtonsPagination: maxButtonsPagination, minButtonsPagination: minButtonsPagination, currentPage: pagina, loadNextButton: loadNextButton, busqueda: false, totalButtonsPagination: totalButtonsPagination };
            productoAgregado = false;
         }
         else if(errorAgregarProducto)
         {
            params = {listaProductos: respuestaQuery, errorAgregarProducto:true, productoAgregado: false, maxButtonsPagination: maxButtonsPagination, minButtonsPagination: minButtonsPagination, currentPage: pagina, loadNextButton: loadNextButton, busqueda: false, totalButtonsPagination: totalButtonsPagination };
            productoAgregado = false;
         }
         res.render('lista-productos', params);
      })
   });
});

router.get('/carritocompras', checkAuthenticated, function(req, res)
{
   sql.query("SELECT PRODUCTO.ID_SKU, NOMBRE, MARCA, IMAGEN, DESCRIPCION, PRECIO, PRODUCTO.CANTIDAD AS 'CANTIDADPRODUCTO', CARRITO.CANTIDAD AS 'CANTIDADCARRITO'  FROM CARRITO INNER JOIN PRODUCTO ON CARRITO.ID_SKU = PRODUCTO.ID_SKU WHERE ID_USUARIO="+req.user.ID_USUARIO, function(carrito1)
   {
      let carrito=carrito1.recordset;
      var totalCompra=0;
      for(const prodCarrito of carrito)
      {
         totalCompra+= (prodCarrito.PRECIO * prodCarrito.CANTIDADCARRITO);
      }
      res.render('carrito-compras', {carritoCompras:carrito, totalCompra:totalCompra});
   });
});

router.post('/carritocompras', checkAuthenticated, function(req, res)
{
   let query = ""
   for(const producto of req.body.datos)
   {
      query = "UPDATE CARRITO SET CANTIDAD = " + producto.cantidad + " WHERE ID_SKU = " + producto.id + " AND ID_USUARIO = " + req.user.ID_USUARIO;
      console.log(query);
      sql.query(query, (respuestaQuery)=>
      {

      });
   }
   res.status(200).send();
});

router.get('/agregar-a-carrito/:id', checkAuthenticated, function(req, res)
{
   let query = "SELECT CANTIDAD FROM CARRITO WHERE ID_SKU = " + req.params.id + " AND ID_USUARIO = " + req.user.ID_USUARIO;
   sql.query(query, (respuestaQuery)=>
   {
      let cantidadProductoCarritoComras = respuestaQuery.rowsAffected[0].length > 0 ? respuestaQuery.recordset[0].CANTIDAD : 0;
      query = "SELECT CANTIDAD FROM PRODUCTO WHERE ID_SKU = " + req.params.id;
      sql.query(query, (respuestaQuery)=>
      {
         let cantidadProductoInventario = respuestaQuery.recordset[0].CANTIDAD;
         if(cantidadProductoCarritoComras < cantidadProductoInventario)
         {
            query = "IF (SELECT COUNT(*) FROM CARRITO WHERE ID_SKU = " + req.params.id + " AND ID_USUARIO = " + req.user.ID_USUARIO + ") = 1 " +
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
            });
         }
         else
         {
            errorAgregarProducto = true;
            res.redirect('../listaproductos');
         }
      });
   })
});

router.get('/eliminar-carrito/:id', checkAuthenticated, function(req, res)
{
   let query= "DELETE FROM CARRITO WHERE ID_SKU= " + req.params.id  + " AND ID_USUARIO= " + req.user.ID_USUARIO;
   sql.query(query, (respuestaQuery)=>
   {
      if(respuestaQuery.rowsAffected > 0)
      {
         res.redirect('/carritocompras');
      }
      
      //sql.query("INSERT INTO CARRITO (ID_SKU, ID_USUARIO) VALUES (" + req.params.id + ", " + req.user.ID_USUARIO + ")")
   });
});

router.get('/finalizarventa', checkAuthenticated, function(req, res)
{
   console.log(req);
   let query = "INSERT INTO HISTORIAL_COMPRA (ID_SKU, ID_USUARIO, CANTIDAD) SELECT ID_SKU, ID_USUARIO, CANTIDAD FROM CARRITO WHERE ID_USUARIO = " + req.user.ID_USUARIO;
   sql.query(query, (respuestaQuery) =>
   {
      if(respuestaQuery.rowsAffected[0] > 0)
      {
         query = "SELECT ID_SKU, ID_USUARIO, CANTIDAD FROM CARRITO WHERE ID_USUARIO = " + req.user.ID_USUARIO;
         sql.query(query, (respuestaQuery)=>
         {
            for(const productoComprado of respuestaQuery.recordset)
            {
               query = "UPDATE PRODUCTO SET CANTIDAD = CANTIDAD - " + productoComprado.CANTIDAD + " WHERE ID_SKU = " + productoComprado.ID_SKU;
               sql.query(query, (respuestaQuery)=>
               {
                  if(respuestaQuery.rowsAffected[0] == 0)
                  {
                     console.log("Hubo un error");
                  }
               });
            }
            query = "DELETE FROM CARRITO WHERE ID_USUARIO = " + req.user.ID_USUARIO;
            sql.query(query, (respuestaQuery)=>
            {
               if(respuestaQuery.rowsAffected[0] > 0)
               {
                  res.redirect('/inicio');
               }
            });
         });
      }      
   });
});

//ZONA DE PROGRAMACIÓN, aquí se debe de poner todo el contenido de programación para cada una de las páginas que
//tengan un procesamiento de base de datos, tiendo como método http "post" em lugar de "get"


module.exports = router;