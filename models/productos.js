const sql = require('../helpers/databaseManager');

const Productos = 
{
   crearProducto: function(dataCrearProducto)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "INSERT INTO PRODUCTO (NOMBRE, PRECIO, CANTIDAD, MARCA, DESCRIPCIÓN) " +
         "VALUES ('" + dataCrearProducto.nombre + "', " + dataCrearProducto.precio + ", " + dataCrearProducto.cantidad + ", '" + dataCrearProducto.marca + "', '" + dataCrearProducto.descripcio + "')";

         sql.query(query, function(respustaQuery)
         {
            if(respustaQuery.rowsAffected > 0)
            {
               resolve();
            }
            else
            {
               reject({ error: respustaQuery });
            }
         });
      });
   },

   modificarProducto: function(idProducto, dataModificarProducto)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "UPDATE PRODUCTO SET NOMBRE = '" + dataModificarProducto.nombre + "', PRECIO = " + dataModificarProducto.precio + ", " +
         "CANTIDAD = " + dataModificarProducto.cantidad + ", MARCA = '" + dataModificarProducto.marca + "', DESCRIPCION = '" + dataModificarProducto.descripcion + "' WHERE ID_SKU = " + idProducto;
         sql.query(query, function(respustaQuery)
         {
            if(respustaQuery.rowsAffected > 0)
            {
               resolve();
            }
            else
            {
               reject({ error: respustaQuery });
            }
         })
      });
   },

   eliminarProducto: function(idProducto)
   {
      return new Promise(function(resolve, reject)
      {
         let query= "DELETE FROM PRODUCTO WHERE ID_SKU = " + idProducto;
         sql.query(query, function(respustaQuery)
         {
            if(respustaQuery.rowsAffected > 0)
            {
               resolve();
            }
            else
            {
               reject({ error: respustaQuery });
            }
         });
      });
   },

   seleccionarProductoPorID: function(idProducto)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT * FROM PRODUCTO WHERE ID_SKU = " + idProducto;
         sql.query(query, function(respustaQuery)
         {
            if(respustaQuery.recordset.length > 0)
            {
               resolve(respustaQuery.recordset[0]);
            }
            else
            {
               reject({ error: respustaQuery });
            }
         });
      });
   },

   seleccionarProductoPorTodosCampos: function(dataSeleccionarProducto)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT ID_SKU FROM PRODUCTO WHERE NOMBRE = '" + dataSeleccionarProducto.nombre + "' AND MARCA = '" + dataSeleccionarProducto.marca  + "' AND PRECIO = " + dataSeleccionarProducto.precio + " " +
         "AND CANTIDAD = " + dataSeleccionarProducto.cantidad + " AND DESCRIPCION = '" +  dataSeleccionarProducto.descripcion + "'";
         sql.query(query, function(respustaQuery)
         {
            if(respustaQuery.recordset.length > 0)
            {
               resolve(respustaQuery.recordset[0]);
            }
            else
            {
               reject({ error: respustaQuery });
            }
         });
      });
   },

   buscarProductosPorNombre: function(nombreProducto)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT * FROM PRODUCTO WHERE NOMBRE like '%" + nombreProducto + "%'";
         sql.query(query, function(respustaQuery)
         {
            if(respustaQuery.recordset.length > 0)
            {
               resolve(respustaQuery.recordset);
            }
            else
            {
               reject({ error: respustaQuery });
            }
         });
      });
   },

   seleccionarCincoProductosAleatoreos: function()
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT TOP 5 * FROM PRODUCTO ORDER BY NEWID()";
         sql.query(query, (respustaQuery) =>
         {
            if(respustaQuery.recordset.length > 0)
            {
               resolve(respustaQuery.recordset);
            }
            else
            {
               reject({ error: respustaQuery });
            }
         });
      });
   },

   seleccionarProductosPorPagina: function(numPagina)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT * FROM " +
         "( "+
            "SELECT ROW_NUMBER() OVER(ORDER BY ID_SKU) NUM, "+
            "* FROM PRODUCTO " +
         ") A " +
         "WHERE NUM > " + 8 * (numPagina- 1) +" AND NUM <= " + 8 * numPagina;
         sql.query(query, function(respustaQuery)
         {
            if(respustaQuery.recordset.length > 0)
            {
               resolve(respustaQuery.recordset);
            }
            else
            {
               reject({ error: respustaQuery });
            }
         })
      });
   },

   seleccionarCuentaTotalProductos: function()
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT COUNT(*) as 'num' FROM PRODUCTO";
         sql.query(query, function(respustaQuery)
         {
            if(respustaQuery.recordset.length > 0)
            {
               resolve(respustaQuery.recordset[0]);
            }
            else
            {
               reject({ error: respustaQuery });
            }
         });
      });
   },

   disminuirCantidadProductos: function(cantidad, idProducto)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "UPDATE PRODUCTO SET CANTIDAD = CANTIDAD - " + cantidad + " WHERE ID_SKU = " + idProducto;
         sql.query(query, function(respustaQuery)
         {
            if(respustaQuery.rowsAffected > 0)
            {
               resolve();
            }
            else
            {
               reject({ error: respustaQuery });
            }
      
         });
      });
   }
}

module.exports = Productos;