const sql = require('../helpers/databaseManager');

const HistorialCompras = 
{
   agregarProductosAHistorialCompras: function(idUsuario)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "INSERT INTO HISTORIAL_COMPRA (ID_SKU, ID_USUARIO, CANTIDAD) " +
         "SELECT ID_SKU, ID_USUARIO, CANTIDAD FROM CARRITO WHERE ID_USUARIO = " + idUsuario;

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

module.exports = HistorialCompras;