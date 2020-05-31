const tipsModelo = require('../models/tips');
const verificator = require('../handlers/verificator');


const TipControlador = 
{
   obtenerTip : async function(req, res, next)
   {
      try
      {
         let tipSeleccionado = await tipsModelo.seleccionarTipPorId(req.params.idTip);
         res.render('tips', { tip: tipSeleccionado });
      }
      catch(error)
      {
         console.log(error);
      }
   }

}

module.exports = TipControlador;