const empleadosModelo = require('../models/empleados');
const verificator = require('../handlers/verificator');


const EmpleadoControlador = 
{
   alertaModulos: false,
   alertaError: false,
   busqueda: false,
   resultadosBusqueda: null,
   mensajeAlertaModulos: "",

   panelPrincipalEmpleados : function(req, res, next)
   {
      let parametrosVista = { administrador: req.user, alertaModulos: EmpleadoControlador.alertaModulos, mensajeAlertaModulos: EmpleadoControlador.mensajeAlertaModulos, busqueda: EmpleadoControlador.busqueda, resultadosBusqueda: EmpleadoControlador.resultadosBusqueda, error: EmpleadoControlador.alertaError, mensajeError: EmpleadoControlador.mensajeAlertaModulos };
      res.render('Administrador/empleados', parametrosVista);
      EmpleadoControlador.alertaModulos = false;
      EmpleadoControlador.alertaError = false;
      EmpleadoControlador.busqueda = false;
      EmpleadoControlador.resultadosBusqueda = null;
      EmpleadoControlador.mensajeAlertaModulos = "";
   },

   cargarPaginaCrearEmpleados: function(req, res, next)
   {
      res.render('Administrador/crear-empleado', { error: EmpleadoControlador.alertaError, mensajeError: EmpleadoControlador.mensajeAlertaModulos });
      EmpleadoControlador.alertaError = false;
      EmpleadoControlador.mensajeAlertaModulos = "";
   },

   crearEmpleado: async function(req, res, next)
   {
      let parametrosDeseados =
      {
         nombre : {type: "string", maxLength: 50, minLength: 1},
         apellidoPaterno : {type: "string", maxLength: 50, minLength: 1},
         apellidoMaterno : {type: "string", maxLength: 50, minLength: 1},
         email : {type: "email", maxLength: 60, minLength: 1},
         password : {type: "string", maxLength: 30, minLength: 1}
      };

      try
      {
         await verificator.Validate(parametrosDeseados, req.body);
      }
      catch(error)
      {
         if(error.hasOwnProperty('expectedMaxLength'))
        {
            EmpleadoControlador.alertaError = true;
            EmpleadoControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/empleados/crear');
        }
        else
        {
            EmpleadoControlador.alertaError = true;
            EmpleadoControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/empleados/crear');
        }
      }

      try
      {
         await empleadosModelo.crearEmpleado(req.body);
         EmpleadoControlador.alertaModulos=true;
         EmpleadoControlador.mensajeAlertaModulos="Empleado Creado";
         res.redirect('./');
      }
      catch(error)
      {
         EmpleadoControlador.alertaError = true;
         EmpleadoControlador.mensajeAlertaModulos = "Hubo un error al intentar crear al empleado";
         res.redirect('/administrador/empleados/crear');
      }
   },

   cargarEmpleadoSeleccionado: async function(req, res, next)
   {
      try
      {
         let empleadoSeleccionado = await empleadosModelo.seleccionarEmpleadoPorID(req.params.idEmpleado);
         res.render('Administrador/actualizar-empleados', { usuario: empleadoSeleccionado, error: EmpleadoControlador.alertaError, mensajeError: EmpleadoControlador.mensajeAlertaModulos });
         EmpleadoControlador.alertaModulos = false;
         EmpleadoControlador.mensajeAlertaModulos = "";
      }
      catch(error)
      {
         EmpleadoControlador.alertaError = true;
         EmpleadoControlador.mensajeAlertaModulos += " Hubo un error al intentar obtener la información del empleado solicitado";   
         res.redirect('/administrador/empleados');
      }
   },

   actualizarEmpleado: async function(req, res, next)
   {
      let parametrosDeseados =
      {
         nombre : {type: "string", maxLength: 50, minLength: 1},
        apellidoPaterno : {type: "string", maxLength: 50, minLength: 1},
        apellidoMaterno : {type: "string", maxLength: 50, minLength: 1},
        email : {type: "email", maxLength: 60, minLength: 1},
      };
      
      try 
      {
         await verificator.Validate(parametrosDeseados, req.body);
      }
      catch(error)
      {
         if(error.hasOwnProperty('expectedMaxLength'))
         {
            EmpleadoControlador.alertaError = true;
            EmpleadoControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/empleados/actualizar/' + req.params.idEmpleado);
         }
         else
         {
            EmpleadoControlador.alertaError = true;
            EmpleadoControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/empleados/actualizar/' + req.params.idEmpleado);
         }
      }

      try
      {
         await empleadosModelo.modificarEmpleado(req.body);
         EmpleadoControlador.alertaModulos=true;
         EmpleadoControlador.mensajeAlertaModulos="Empleado Actualizado";
         res.redirect('/administrador/empleados');
      }
      catch(error)
      {
         EmpleadoControlador.alertaError = true;
         EmpleadoControlador.mensajeAlertaModulos = "Hubo un error al intentar actualizar el empleado.";
         res.redirect('/administrador/empleados/actualizar/' + req.params.idEmpleado);
      }
   },

   eliminarEmpleado: async function(req, res, next)
   {
      try
      {
         await empleadosModelo.eliminarEmpleado(req.params.idEmpleado);
         EmpleadoControlador.alertaModulos=true;
         EmpleadoControlador.mensajeAlertaModulos="Empleado Eliminado";
         res.redirect('/administrador/empleados');
      }
      catch(error)
      {
         EmpleadoControlador.alertaError=true;
         EmpleadoControlador.mensajeAlertaModulos="Hubo un error al intentar eliminar el empleado";
         res.redirect('/administrador/empleados');
      }
   },

   buscarEmpleados: async function(req, res, next)
   {
      try
      {
         let empleadosBuscados = empleadosModelo.buscarEmpleadosPorNombre(req.query.nombreBuscar);
         EmpleadoControlador.busqueda=true;
         EmpleadoControlador.resultadosBusqueda = empleadosBuscados;
         res.redirect('./')
      }
      catch(error)
      {
         EmpleadoControlador.alertaError=true;
         EmpleadoControlador.mensajeAlertaModulos="Hubo un error al intentar buscar los empleados";
         res.redirect('/administrador/empleados');
      }
   }
}

module.exports = EmpleadoControlador;