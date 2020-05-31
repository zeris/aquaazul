const modeloProducto = require('../models/productos');
const verificator = require('../handlers/verificator');
const path = require('path');
const fs = require('fs');

const ProductoControlador = 
{
   alertaModulos: false,
   alertaError: false,
   busqueda: false,
   resultadosBusqueda: null,
   mensajeAlertaModulos: "",

   panelPrincipalProductos : function(req, res, next)
   {
      let parametrosVista = { administrador: req.user, alertaModulos: ProductoControlador.alertaModulos, mensajeAlertaModulos: ProductoControlador.mensajeAlertaModulos, busqueda: ProductoControlador.busqueda, resultadosBusqueda: ProductoControlador.resultadosBusqueda, error: ProductoControlador.alertaError, mensajeError: ProductoControlador.mensajeAlertaModulos };
      res.render('Administrador/productos', parametrosVista);
      ProductoControlador.alertaModulos = false;
      ProductoControlador.alertaError = false;
      ProductoControlador.busqueda = false;
      ProductoControlador.resultadosBusqueda = null;
      ProductoControlador.mensajeAlertaModulos = "";
   },

   cargarPaginaCrearProductos: function(req, res, next)
   {
      res.render('Administrador/crear-producto', { error: ProductoControlador.alertaError, mensajeError: ProductoControlador.mensajeAlertaModulos });
      ProductoControlador.alertaError = false;
      ProductoControlador.mensajeAlertaModulos = "";
   },

   crearProducto: async function(req, res, next)
   {
      Object.setPrototypeOf(req.body, Object.prototype);
      let parametrosDeseados =
      {
         nombre : {type: "string", maxLength: 60, minLength: 1},
         precio : {type: "double", minLength: 1},
         cantidad : {type: "int", minLength: 1},
         marca : {type: "string", maxLength: 60, minLength: 1},
         descripcion : {type: "string", maxLength: 120, minLength: 1}
      };

      try
      {
         await verificator.Validate(parametrosDeseados, req.body);
      }
      catch(error)
      {
         if(error.hasOwnProperty('expectedMaxLength'))
        {
            ProductoControlador.alertaError = true;
            ProductoControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/productos/crear');
        }
        else
        {
            ProductoControlador.alertaError = true;
            ProductoControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/productos/crear');
        }
      }

      try
      {
         await modeloProducto.crearProducto(req.body);
      }
      catch(error)
      {
         ProductoControlador.alertaError = true;
         ProductoControlador.mensajeAlertaModulos = "Hubo un error al intentar crear al producto";
         res.redirect('/administrador/productos/crear');
      }

      let dataProductoAgregado = null;

      try
      {
         dataProductoAgregado = await modeloProducto.seleccionarProductoPorTodosCampos(req.body);
      }
      catch(error)
      {
         ProductoControlador.alertaError = true;
         ProductoControlador.mensajeAlertaModulos = "EL producto ha sido guardado, pero hubo un error al intentar guardar la imágen";
         res.redirect('/administrador/productos/crear');
      }

      let basePath =path.dirname(require.main.filename);
      fs.rename(basePath + "/temp/" + req.file.filename , basePath + "/public/images/productos/" + dataProductoAgregado.ID_SKU + ".jpg", (error)=>
      {
            if(error)
            {
               ProductoControlador.alertaModalertaErrorulos = true;
               ProductoControlador.mensajeAlertaModulos = "EL producto ha sido guardado, pero hubo un error al intentar renombrar y guardar la imágen";
               res.redirect('/administrador/productos/crear');
            }
            else
            {
               ProductoControlador.alertaModulos=true;
               ProductoControlador.mensajeAlertaModulos="Producto Creado";
               res.redirect('./');
            }
      });
   },

   cargarProductoSeleccionado: async function(req, res, next)
   {
      try
      {
         let productoSeleccionado = await modeloProducto.seleccionarProductoPorID(req.params.idProducto);
         res.render('Administrador/actualizar-producto', { producto: productoSeleccionado, error: ProductoControlador.alertaError, mensajeError: ProductoControlador.mensajeAlertaModulos });
         ProductoControlador.alertaModulos = false;
         ProductoControlador.mensajeAlertaModulos = "";
      }
      catch(error)
      {
         ProductoControlador.alertaError = true;
         ProductoControlador.mensajeAlertaModulos += " Hubo un error al intentar obtener la información del producto solicitado";   
         res.redirect('/administrador/productos');
      }
   },

   actualizarProducto: async function(req, res, next)
   {
      let parametrosDeseados =
      {
         nombre : {type: "string", maxLength: 60, minLength: 1},
         precio : {type: "double", minLength: 1},
         cantidad : {type: "int", minLength: 1},
         marca : {type: "string", maxLength: 60, minLength: 1},
         descripcion : {type: "string", maxLength: 120, minLength: 1}
      };
      
      try 
      {
         await verificator.Validate(parametrosDeseados, req.body);
      }
      catch(error)
      {
         if(error.hasOwnProperty('expectedMaxLength'))
         {
            ProductoControlador.alertaError = true;
            ProductoControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/productos/actualizar/' + req.params.idProducto);
         }
         else
         {
            ProductoControlador.alertaError = true;
            ProductoControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/productos/actualizar/' + req.params.idProducto);
         }
      }

      try
      {
         await modeloProducto.actualizarProducto(req.body);
         ProductoControlador.alertaModulos=true;
         ProductoControlador.mensajeAlertaModulos="Producto Actualizado";
         res.redirect('/administrador/productos');
      }
      catch(error)
      {
         ProductoControlador.alertaError = true;
         ProductoControlador.mensajeAlertaModulos = "Hubo un error al intentar actualizar el producto.";
         res.redirect('/administrador/productos/actualizar/' + req.params.idProducto);
      }
   },

   eliminarProducto: async function(req, res, next)
   {
      try
      {
         await modeloProducto.eliminarProducto(req.params.idProducto);
         ProductoControlador.alertaModulos=true;
         ProductoControlador.mensajeAlertaModulos="Producto Eliminado";
         res.redirect('/administrador/productos');
      }
      catch(error)
      {
         ProductoControlador.alertaError=true;
         ProductoControlador.mensajeAlertaModulos="Hubo un error al intentar eliminar el producto";
         res.redirect('/administrador/productos');
      }
   },

   buscarProductos: async function(req, res, next)
   {
      try
      {
         let productosBuscados = modeloProducto.buscarProductosPorNombre(req.query.nombreBuscar);
         ProductoControlador.busqueda=true;
         ProductoControlador.resultadosBusqueda = productosBuscados;
         res.redirect('./')
      }
      catch(error)
      {
         ProductoControlador.alertaError=true;
         ProductoControlador.mensajeAlertaModulos="Hubo un error al intentar buscar los productos";
         res.redirect('/administrador/productos');
      }
   }
}

module.exports = ProductoControlador;