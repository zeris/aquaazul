const usuarioModelo = require('../models/usuarios');
const verificator = require('../handlers/verificator');


const UsuarioControlador = 
{
   alertaModulos: false,
   alertaError: false,
   busqueda: false,
   resultadosBusqueda: null,
   mensajeAlertaModulos: "",

   panelPrincipalUsuarios : function(req, res, next)
   {
      let parametrosVista = { administrador: req.user, alertaModulos: UsuarioControlador.alertaModulos, mensajeAlertaModulos: UsuarioControlador.mensajeAlertaModulos, busqueda: UsuarioControlador.busqueda, resultadosBusqueda: UsuarioControlador.resultadosBusqueda, error: UsuarioControlador.alertaError, mensajeError: UsuarioControlador.mensajeAlertaModulos };
      res.render('Administrador/usuarios', parametrosVista);
      UsuarioControlador.alertaModulos = false;
      UsuarioControlador.alertaError = false;
      UsuarioControlador.busqueda = false;
      UsuarioControlador.resultadosBusqueda = null;
      UsuarioControlador.mensajeAlertaModulos = "";
   },

   cargarPaginaCrearUsuarios: function(req, res, next)
   {
      res.render('Administrador/crear-usuario', { error: UsuarioControlador.alertaError, mensajeError: UsuarioControlador.mensajeAlertaModulos });
      UsuarioControlador.alertaError = false;
      UsuarioControlador.mensajeAlertaModulos = "";
   },

   crearUsuario: async function(req, res, next)
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
            UsuarioControlador.alertaError = true;
            UsuarioControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/usuarios/crear');
        }
        else
        {
            UsuarioControlador.alertaError = true;
            UsuarioControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/usuarios/crear');
        }
      }

      try
      {
         await usuarioModelo.crearUsuario(req.body);
         UsuarioControlador.alertaModulos=true;
         UsuarioControlador.mensajeAlertaModulos="Usuario Creado";
         res.redirect('./');
      }
      catch(error)
      {
         UsuarioControlador.alertaError = true;
         UsuarioControlador.mensajeAlertaModulos = "Hubo un error al intentar crear al usuario";
         res.redirect('/administrador/usuarios/crear');
      }
   },

   cargarUsuarioSeleccionado: async function(req, res, next)
   {
      try
      {
         let usuarioSeleccionado = await usuarioModelo.seleccionarUsuarioPorID(req.params.idUsuario);
         res.render('Administrador/actualizar-usuarios', { usuario: usuarioSeleccionado, error: UsuarioControlador.alertaError, mensajeError: UsuarioControlador.mensajeAlertaModulos });
         UsuarioControlador.alertaModulos = false;
         UsuarioControlador.mensajeAlertaModulos = "";
      }
      catch(error)
      {
         UsuarioControlador.alertaError = true;
         UsuarioControlador.mensajeAlertaModulos += " Hubo un error al intentar obtener la información del usuario solicitado";   
         res.redirect('/administrador/usuarios');
      }
   },

   actualizarUsuario: async function(req, res, next)
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
            UsuarioControlador.alertaError = true;
            UsuarioControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/usuarios/actualizar/' + req.params.idUsuario);
         }
         else
         {
            UsuarioControlador.alertaError = true;
            UsuarioControlador.mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/usuarios/actualizar/' + req.params.idUsuario);
         }
      }

      try
      {
         await usuarioModelo.modificarUsuario(req.body);
         UsuarioControlador.alertaModulos=true;
         UsuarioControlador.mensajeAlertaModulos="Usuario Actualizado";
         res.redirect('/administrador/usuarios');
      }
      catch(error)
      {
         UsuarioControlador.alertaError = true;
         UsuarioControlador.mensajeAlertaModulos = "Hubo un error al intentar actualizar el usuario.";
         res.redirect('/administrador/usuarios/actualizar/' + req.params.idUsuario);
      }
   },

   eliminarUsuario: async function(req, res, next)
   {
      try
      {
         await usuarioModelo.eliminarUsuario(req.params.idUsuario);
         UsuarioControlador.alertaModulos=true;
         UsuarioControlador.mensajeAlertaModulos="Usuario Eliminado";
         res.redirect('/administrador/usuarios');
      }
      catch(error)
      {
         UsuarioControlador.alertaError=true;
         UsuarioControlador.mensajeAlertaModulos="Hubo un error al intentar eliminar el usuario";
         res.redirect('/administrador/usuarios');
      }
   },

   buscarUsuarios: async function(req, res, next)
   {
      try
      {
         let usuariosBuscados = usuarioModelo.buscarUsuariosPorNombre(req.query.nombreBuscar);
         UsuarioControlador.busqueda=true;
         UsuarioControlador.resultadosBusqueda = usuariosBuscados;
         res.redirect('./')
      }
      catch(error)
      {
         UsuarioControlador.alertaError=true;
         UsuarioControlador.mensajeAlertaModulos="Hubo un error al intentar buscar los usuarios";
         res.redirect('/administrador/usuarios');
      }
   }
}

module.exports = UsuarioControlador;