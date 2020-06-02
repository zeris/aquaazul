const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const sql = require('../helpers/databaseManager');

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth:
   {
      user: 'aquaazuladm@gmail.com',
      pass: 'F3rn4nd4#&'
   }
});

let error = false;
let errorMessage = "";
let pedirCorreo = true;
let tokenEnviado = false;
let tokenValidado = false;
let idUsario = null;


//ZONA DE RUTAS, aquí se debe el nombre del archivo .ejs (el cual contiene el html) y la ruta en la que se
//desea mostrar dicha página web.
router.get('/recoverpass', function(req, res)
{
   error = false;
   errorMessage = "";
   pedirCorreo = true;
   tokenEnviado = false;
   tokenValidado = false;
   idUsario = null;
   res.redirect('/recoverpassword');
});


router.get('/recoverpassword', function(req, res)
{
   res.render('recuperar-contraseña', { error: error, errorMessage: errorMessage, pedirCorreo: pedirCorreo, tokenEnviado: tokenEnviado, tokenValidado: tokenValidado });
   error = false;
   errorMessage = "";
});

router.post('/recoverpassword', function(req, res)
{
   let query = "SELECT * FROM USUARIO WHERE EMAIL = '" + req.body.email + "'";
   sql.query(query, function(respuestaQuery)
   {
      if(respuestaQuery.rowsAffected[0] > 0)
      {
         let token = generateToken(6);
         query = "UPDATE USUARIO SET TOKENRECUPERARCONTRASENIA = '" + token + "' WHERE ID_USUARIO = " + respuestaQuery.recordset[0].ID_USUARIO;
         
         idUsario =  respuestaQuery.recordset[0].ID_USUARIO;
         sql.query(query, function(respuestaQuery)
         {
            if(respuestaQuery.rowsAffected[0] > 0)
            {
               var mailOptions =
               {
                  from: 'aquaazuladm@gmail.com',
                  to: req.body.email,
                  subject: 'Recuperar contraseña',
                  text: '¡Hola! Para restablecer tu contraseña por favor ingresa el siguiente código en la página de Aqua Azul: "' + token + '". ' +
                  'Si tu no solicitaste dicho cambio de contraseña, por favor ignora este correo' 
               };

               transporter.sendMail(mailOptions, function(error, info)
               {
                  if(error)
                  {
                     console.log(error);
                     error = true;
                     idUsario = null;
                     errorMessage = "Error al intentar enviar el token. por favor contacte con al desarrollador.";
                     res.redirect('/recoverpassword');
                  }
                  else
                  {
                     console.log('Correo enviado: ' + info.response);
                     tokenEnviado = true;
                     pedirCorreo = false;
                     res.redirect('/recoverpassword');
                  }
               });
            }
            else
            {
               error = true;
               idUsario = null;
               errorMessage = "Error al intentar guardar token. por favor contacte con al desarrollador.";
               res.redirect('/recoverpassword');
            }
         });
      }
      else
      {
         error = true;
         idUsario = null;
         errorMessage = "No hay ningún usuario con dicho correo registrado, intentelo nuevamente."
         res.redirect('/recoverpassword');
      }
   });
});

router.post('/recoverpassword/verify/token', function(req, res)
{
   let query = "SELECT * FROM USUARIO WHERE TOKENRECUPERARCONTRASENIA = '" + req.body.token + "'";
   sql.query(query, function(respuestaQuery)
   {
      if(respuestaQuery.rowsAffected[0] > 0)
      {
         tokenEnviado = false;
         tokenValidado = true;
         res.redirect('/recoverpassword');
      }
      else
      {
         error = true;
         errorMessage = "Código incorrecto, intentelo nuevamente."
         res.redirect('/recoverpassword');
      }
   });
});

router.post('/setpassword', function(req, res)
{
   let query = "UPDATE USUARIO SET CONTRASENIA = '" + req.body.password + "' WHERE ID_USUARIO = " + idUsario;
   sql.query(query, function(respuestaQuery)
   {
      if(respuestaQuery.rowsAffected[0] > 0)
      {
         idUsario = null;
         res.redirect('/login');
      }
      else
      {
         error = true;
         errorMessage = "Error al intentar actualizar la contraseña, por favor contacte al desarrollador."
         res.redirect('/recoverpassword');
      }
   });
  
});

function generateToken(length) 
{
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

module.exports = router;