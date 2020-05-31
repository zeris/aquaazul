const express = require('express');
const router = express.Router();
const passport = require('passport');
const carritoComprasRutas = require('../routes/carrito-compras');
const empleadoRutas = require('../routes/empleados');
const listaProductosRutas = require('../routes/lista-productos');
const productosRutas = require('../routes/productos');
const tipsRutas = require('../routes/tips');
const usuarioRutas = require('../routes/usuario');

function checkAuthenticated(req, res, next) 
{
    if (req.isAuthenticated()) 
    {
      return next();
    }
    res.redirect("/login");
}

router.get('/', function(req, res)
{
   res.redirect('login')
});

router.get('/login', function(req, res)
{
   let errors = req.flash().error || [];
   console.log(errors);
   res.render('login', { errors });
});

router.post('/login', passport.authenticate('local', {
   failureFlash: true,
   failureRedirect: "/login"}),(req,res,next)=>{
   if(req.user.ADMINISTRADOR == true)
   {
      res.redirect('/administrador/inicio');
   }
   else 
   {
      res.redirect('/inicio');
   }
});

   router.get('/inicio', checkAuthenticated, function(req, res)
{
   let productos
   let query = "SELECT TOP 5 * FROM PRODUCTO ORDER BY NEWID()";
   sql.query(query, (productosInicio) =>
   {
      sql.query("SELECT * FROM TIP", (listaTips)=>
      {
         res.render('inicio', { productos: productosInicio.recordset, tips: listaTips.recordset });
      })
   })
  
});

router.use('/', carritoComprasRutas);
router.use('/', listaProductosRutas);
router.use('/', tipsRutas);

router.get('/administrador/inicio', checkAuthenticated, function(req,res,next)
{
    res.render('Administrador/inicio', {administrador:req.user})
});

router.use('/administrador/empleados', empleadoRutas);
router.use('/administrador/productos', productosRutas);
router.use('/administrador/usuarios', usuarioRutas);

module.exports = router;