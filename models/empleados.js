const sql = require('../helpers/databaseManager');

const Empleados = 
{
   crearEmpleado: function(dataCrearEmpleado)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "INSERT INTO USUARIO (NOMBRE, APELLIDO_P, APELLIDO_M, EMAIL, CONTRASENIA, ADMINISTRADOR) " +
         "VALUES ('" + dataCrearEmpleado.nombre + "', '" + dataCrearEmpleado.apellidoPaterno + "', '" + dataCrearEmpleado.apellidoMaterno + "', "+
         "'" + dataCrearEmpleado.email + "', '" + dataCrearEmpleado.password + "', 'true')";

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

   modificarEmpleado: function(idEmpleado, dataModificarEmpleado)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "UPDATE USUARIO SET NOMBRE = '" + dataModificarEmpleado.nombre + "', APELLIDO_P = '" + dataModificarEmpleado.apellidoPaterno + "', " +
         "APELLIDO_M = '" + dataModificarEmpleado.apellidoMaterno + "', EMAIL = '" + dataModificarEmpleado.email + "' WHERE ADMINISTRADOR = 'true' and ID_USUARIO = " + idEmpleado;
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

   eliminarEmpleado: function(idEmpleado)
   {
      return new Promise(function(resolve, reject)
      {
         let query= "DELETE FROM USUARIO WHERE ADMINISTRADOR = 'true' AND ID_USUARIO = " + idEmpleado;
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

   seleccionarEmpleadoPorID: function(idEmpleado)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT * FROM USUARIO WHERE ADMINISTRADOR = 'true' AND ID_USUARIO = " + idEmpleado;
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

   buscarEmpleadosPorNombre: function(nombreEmpleado)
   {
      return new Promise(function(resolve, reject)
      {
         let query = "SELECT * FROM USUARIO WHERE ADMINISTRADOR = 'true' AND NOMBRE like '%" + nombreEmpleado + "%'";
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

module.exports = Empleados;