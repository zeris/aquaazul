const carritoComprasModelo = require('../models/carrito-compras');
const historiaComprasModelo = require('../models/historial-compras');
const porductosModelo = require('../models/productos');
const verificator = require('../handlers/verificator');


const ListaProductosControlador = 
{
   obtenerProductosCarrito : async function(req, res, next)
   {
      try
      {
         productosCarrito = await carritoComprasModelo.seleccionarProductosCarritoCompras(req.user.ID_USUARIO);
      }
      catch(error)
      {
         console.log(error);
      }

      let totalCompra=0;
      for(const prodCarrito of productosCarrito)
      {
         totalCompra+= prodCarrito.PRECIO;
      }
      res.render('carrito-compras', { carritoCompras:productosCarrito, totalCompra:totalCompra });
   },

   agregarCarrito: async function(req, res, next)
   {
      try
      {
         await carritoComprasModelo.agregarProductoACarritoCompras(req.user.ID_USUARIO, req.params.id);
         productoAgregado = true;
         res.redirect('../listaproductos');
      }
      catch(error)
      {
         console.log(error);
      }
   },

   eliminarCarrito: async function(req, res, next)
   {
      try
      {
         await carritoComprasModelo.eliminarProductoDeCarritoCompras(req.user.ID_USUARIO, req.params.id);
         res.redirect('/carritocompras');
      }
      catch(error)
      {
         console.log(error);
      }
   },

   finalizarCompra: async function(req, res, next)
   {      
      try
      {
         await historiaComprasModelo.agregarProductosAHistorialCompras(req.user.ID_USUARIO);
      }
      catch(error)
      {
         console.log(error);
      }

      let productosCarritos = null;
      try
      {
         productosCarrito = await carritoComprasModelo.seleccionarProductosCarritoCompras(req.user.ID_USUARIO);
      }
      catch(error)
      {
         console.log(error);
      }

      for(const productoCarrito of productosCarrito)
      {
         try
         {
            await porductosModelo.disminuirCantidadProductos(productosCarrito.CANTIDAD, productosCarrito.ID_SKU);
         }
         catch(error)
         {
            console.log(error);
         }
      }

      try
      {
         await carritoComprasModelo.vaciarCarritoCompras(req.user.ID_USUARIO);
      }
      catch(error)
      {
         console.log(error);
      }
   }
}

module.exports = carritoComprasModelo;