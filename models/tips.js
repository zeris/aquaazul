const sql = require('../helpers/databaseManager');

const Tips = 
{
   seleccionarTips: function()
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT * FROM TIP";

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

   seleccionarTipPorId: function(idTip)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT * FROM TIP WHERE ID_TIP = " + idTip;
         
         sql.query(query, function(respuestaQuery)
         {
            if(respuestaQuery.recordset.length > 0)
            {
               resolve(respuestaQuery.recordset[0]);
            }
            else
            {
               reject({ error: respuestaQuery });
            }
         });
      });
   }
}

module.exports = Tips;