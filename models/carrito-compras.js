const sql = require('../helpers/databaseManager');

const CarritoCompras = 
{
   seleccionarProductosCarritoCompras: function(idUsuario)
   {
      return new Promise(function(resolve, reject)
      {
         let query = ""+
         "SELECT PRODUCTO.ID_SKU, NOMBRE, MARCA, DESCRIPCION, PRECIO, CANTIDAD " +
         "FROM CARRITO " +
            "INNER JOIN PRODUCTO ON CARRITO.ID_SKU = PRODUCTO.ID_SKU " +
         "WHERE ID_USUARIO = " + idUsuario;
         
         sql.query(query, function(respuestaQuery)
         {
            if(respuestaQuery.recordset.length > 0)
            {
               resolve(respuestaQuery.recordset);
            }
            else
            {
               reject({ error: respuestaQuery });
            }
         });
      });
   },

   agregarProductoACarritoCompras: function(idUsuario, idProducto)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "IF (SELECT COUNT(*) FROM CARRITO WHERE ID_SKU = " + idProducto + " AND ID_USUARIO = " + idUsuario + ") = 1 " +
         "BEGIN " +
            "UPDATE CARRITO SET CANTIDAD = CANTIDAD + 1 WHERE  ID_SKU = " + idProducto + " AND ID_USUARIO = " + idUsuario + " " +
         "END " +
         "ELSE " +
         "BEGIN " +
            "INSERT INTO CARRITO (ID_SKU, ID_USUARIO, CANTIDAD) VALUES (" + idProducto + ", " + idUsuario + ", 1) " +
         "END";

         sql.query(query, function(respuestaQuery)
         {
            if(respuestaQuery.rowsAffected > 0)
            {
               resolve();
            }
            else
            {
               reject({ error: respuestaQuery });
            }
         });
      });
   },

   eliminarProductoDeCarritoCompras: function(idUsuario, idProducto)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "DELETE FROM CARRITO WHERE ID_SKU= " +idProducto  + " AND ID_USUARIO= " + idUsuario;
         sql.query(query, function(respuestaQuery)
         {
            if(respuestaQuery.rowsAffected > 0)
            {
               resolve();
            }
            else
            {
               reject({ error: respuestaQuery });
            }
         });
      });
   },

   vaciarCarritoCompras: function(idUsuario)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "DELETE FROM CARRITO WHERE ID_USUARIO = " + idUsuario;
         sql.query(query, function(respuestaQuery)
         {
            if(respuestaQuery.rowsAffected > 0)
            {
               resolve();
            }
            else
            {
               reject({ error: respuestaQuery });
            }
         });
      });
   }
}

module.exports = CarritoCompras;