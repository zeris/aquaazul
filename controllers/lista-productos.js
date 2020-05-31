const productosModelo = require('../models/productos');
const verificator = require('../handlers/verificator');


const ListaProductosControlador = 
{
   obtenerProductosPagina : async function(req, res, next)
   {
      let productosPagina = null;
      try
      {
         productosPagina = await productosModelo.Productos.seleccionarProductosPorPagina(req.params.pagina);
      }
      catch(error)
      {
         console.log(error);
      }

      let totalProductos = null
      try
      {
         totalProductos = await productosModelo.Productos.seleccionarCuentaTotalProductos();
      }
      catch(error)
      {
         console.log(error);
      }

      let totalButtonsPagination = totalProductos.num / 8;
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

      let params = {listaProductos: productosPagina, productoAgregado: false, maxButtonsPagination: maxButtonsPagination, minButtonsPagination: minButtonsPagination, currentPage: pagina, loadNextButton: loadNextButton, busqueda: false };
      if(productoAgregado)
      {
         params = {listaProductos: productosPagina, productoAgregado: true, maxButtonsPagination: maxButtonsPagination, minButtonsPagination: minButtonsPagination, currentPage: pagina, loadNextButton: loadNextButton, busqueda: false };
         productoAgregado = false;
      }
      res.render('lista-productos', params);
   },

   buscarProductos: async function(req, res, next)
   {
      try
      {
         let resultadoBusqueda = await productosModelo.Productos.buscarProductosPorNombre(req.query.nombreBuscar);
         let params = {listaProductos: resultadoBusqueda, productoAgregado: false, busqueda: true};
         res.render('lista-productos', params);
      }
      catch(error)
      {
         console.log(error);
      }
   }
}

module.exports = ListaProductosControlador;