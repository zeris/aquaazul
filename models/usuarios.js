const sql = require('../helpers/databaseManager');

const Usuarios = 
{
   crearUsuario: function(dataCrearUsuario)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "INSERT INTO USUARIO (NOMBRE, APELLIDO_P, APELLIDO_M, EMAIL, CONTRASENIA, ADMINISTRADOR) " +
         "VALUES ('" + dataCrearUsuario.nombre + "', '" + dataCrearUsuario.apellidoPaterno + "', '" + dataCrearUsuario.apellidoMaterno + "', "+
         "'" + dataCrearUsuario.email + "', '" + dataCrearUsuario.password + "', 'false')";

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

   modificarUsuario: function(idUsuario, dataModificarUsuario)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "UPDATE USUARIO SET NOMBRE = '" + dataModificarUsuario.nombre + "', APELLIDO_P = '" + dataModificarUsuario.apellidoPaterno + "', " +
         "APELLIDO_M = '" + dataModificarUsuario.apellidoMaterno + "', EMAIL = '" + dataModificarUsuario.email + "' WHERE ADMINISTRADOR = 'false' and ID_USUARIO = " + idUsuario;
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

   eliminarUsuario: function(idUsuario)
   {
      return new Promise(function(resolve, reject)
      {
         let query= "DELETE FROM USUARIO WHERE ADMINISTRADOR = 'false' AND ID_USUARIO = " + idUsuario;
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

   seleccionarUsuarioPorID: function(idUsuario)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT * FROM USUARIO WHERE ADMINISTRADOR = 'false' AND ID_USUARIO = " + idUsuario;
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

   buscarUsuariosPorNombre: function(nombreUsuario)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT * FROM USUARIO WHERE ADMINISTRADOR = 'false' AND NOMBRE like '%" + nombreUsuario + "%'";
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
   }
}

module.exports = Usuarios;