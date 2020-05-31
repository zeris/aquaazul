const express = require('express');
const router = express.Router();
const tipControlador = require('../controllers/tips');

function checkAuthenticated(req, res, next) 
{
   if (req.isAuthenticated()) 
   {
     return next();
   }
   res.redirect("/login");
}

router.get("/tips/:idTip", checkAuthenticated, tipControlador.obtenerTip);


module.exports = router;