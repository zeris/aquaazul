const sql = require('mssql');

//Descomentar credenciales que pertenezcan y descomentar las que no pertenezcan al servidor local
const sqlConfig = 
{
   local : 
   {
      user: 'fernanda',
      password: '12345',
      server: 'DESKTOP-S44R409\\SQLEXPRESS',
      //user: 'sa',
      //password: 'a1',
      //server: 'LAPTOP-UCMMQ8CB\\SQLEXPRESS',  
      database: 'CARRITO',
      port: 1433
   },
   azure :
   {
      user: 'adminLogin',
      password: 'admin',
      server: 'severname.database.windows.net',    // don't add tcp & port number
      database: 'databaseName',
      options: 
      {
         encrypt: true
      }
   }
}


const sqlServer = 
{
   query: function(query, callback)
   {
      let response = [];
      let conn = new sql.ConnectionPool(sqlConfig.local);

      conn.connect().then(function()
      {
         let req = new sql.Request(conn);
         req.query(query).then(function(recordset)
         {
            conn.close();
            callback(recordset);
         })
         .catch(function(err)
         {
            console.log(err);
            conn.close();
         })
      })
      .catch(function(err)
      {
         console.log(err);
      });

      /*sql.connect(sqlConfig.local, function(err)
      {
         if(err)
            console.log(err);
         
         let sqlRequest = new sql.Request();
         sqlRequest.
         sqlRequest.query(query, function(err,data)
         {
            if(err)
               console.log(err)
            response.slice(data.recordset);
            
            sql.close();   
         });

         console.log(response);
         return response;
      });*/
   }
}

module.exports = sqlServer;