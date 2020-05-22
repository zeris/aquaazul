const express = require('express');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const app = express();
const sql = require('./helpers/databaseManager');
const rutaIndex = require('./routes/index');
const rutaAdministrador = require('./routes/administrador');
const bodyParser = require('body-parser');
const passportLocal = require('passport-local').Strategy;
//Se inicializa puerto 
app.set('port', 10000);

//Dependencias necesarias para que el servidor funcione
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(flash());
app.use(session({
  secret: "TeAmoMabel",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(function(username, password, done)
{
    sql.query("SELECT * FROM USUARIO WHERE EMAIL = '" + username + "' AND CONTRASENIA = '" + password + "'", function(user)
    {
        let usuario=user.recordset;
        if(usuario.length > 0)
        {
            return done(null, usuario[0]);
        }
        
        done(null, false);
    });
}));

passport.serializeUser(function(user, done)
{
    done(null, user.ID_USUARIO);
});

passport.deserializeUser(function(id, done)
{
    sql.query("SELECT * FROM USUARIO WHERE ID_USUARIO = " + id, function(user)
    {
        let usuario=user.recordset;
        if(usuario.length > 0)
        {
            return done(null, usuario[0]);
        }
        
        done(null, false);
    });
});

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use('/', rutaIndex);
app.use('/administrador', rutaAdministrador);


//Se inicia el servidor y se envia aviso
app.listen(app.get('port'), ()=> console.log("Aqua azul NodeJS listening on Port: ",app.get('port')));