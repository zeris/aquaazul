const express = require('express');
const router = express.Router();
const sql = require('../helpers/databaseManager');
let verificator = require('../handlers/verificator');
const multer = require('multer');
const path = require('path');
let upload = multer({dest: path.dirname(require.main.filename) + "/temp/"});
const fs = require('fs');


let alertaModulos=false;
let mensajeAlertaModulos="";

let busqueda=false;
let resultadosBusqueda=null;

function checkAuthenticated(req, res, next) 
{
    if (req.isAuthenticated()) 
    {
      return next();
    }
    res.redirect("/login");
}

router.get('/inicio', function(req,res,next)
{
    res.render('Administrador/inicio', {administrador:req.user})
});

router.get('/usuarios', function(req,res,next)
{
    res.render('Administrador/usuarios', {administrador:req.user, alertaModulos:alertaModulos, mensajeAlertaModulos:mensajeAlertaModulos, busqueda:busqueda, resultadosBusqueda:resultadosBusqueda})
    alertaModulos=false;
    mensajeAlertaModulos="";
    busqueda=false;
    resultadosBusqueda=null;
});

router.get('/usuarios/crear', function(req,res,next)
{
    res.render('Administrador/crear-usuario', {error: alertaModulos, mensajeError: mensajeAlertaModulos});
    alertaModulos = false;
    mensajeAlertaModulos = "";
});

router.post('/usuarios/crear', async function(req,res,next)
{
    let parametrosDeseados =
    {
        nombre : {type: "string", maxLength: 15, minLength: 1},
        apellidoPaterno : {type: "string", maxLength: 15, minLength: 1},
        apellidoMaterno : {type: "string", maxLength: 15, minLength: 1},
        email : {type: "email", maxLength: 30, minLength: 1},
        password : {type: "string", maxLength: 30, minLength: 1}
    };
    
    try 
    {
        await verificator.Validate(parametrosDeseados, req.body);
        var query="insert into usuario (NOMBRE, APELLIDO_P, APELLIDO_M, EMAIL, CONTRASENIA, ADMINISTRADOR) " +
        "values ('" + req.body.nombre + "', '" + req.body.apellidoPaterno + "', '" + req.body.apellidoMaterno + "'," +
        "'" + req.body.email + "', '" + req.body.password + "', 'false')";

        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected > 0)
            {
                alertaModulos=true;
                mensajeAlertaModulos="Usuario Creado";
                res.redirect('./');
            }
        });
    } 
    catch (error) 
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/usuarios/crear');
        }
        else
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/usuarios/crear');
        }
    }
});

router.get('/usuarios/actualizar/:idUsuario', function(req,res,next)
{
    let query= "select * from usuario where ID_USUARIO = " + req.params.idUsuario;
    sql.query(query, (respuestaQuery)=>
    {

        res.render('Administrador/actualizar-usuario', { usuario:respuestaQuery.recordset[0], error: alertaModulos, mensajeError : mensajeAlertaModulos });
        alertaModulos = false;
        mensajeError = "";
    })
});

router.post('/usuarios/actualizar/:idUsuario', async function(req,res,next)
{
    let parametrosDeseados =
    {
        nombre : {type: "string", maxLength: 15, minLength: 1},
        apellidoPaterno : {type: "string", maxLength: 15, minLength: 1},
        apellidoMaterno : {type: "string", maxLength: 15, minLength: 1},
        email : {type: "email", maxLength: 30, minLength: 1},
        password : {type: "string", maxLength: 30, minLength: 1}
    };

    try
    {
        await verificator.Validate(parametrosDeseados, req.body);
        let query= "UPDATE USUARIO SET NOMBRE = '" + req.body.nombre + "', APELLIDO_P = '" + req.body.apellidoPaterno + "', " +
        "APELLIDO_M = '" + req.body.apellidoMaterno + "', EMAIL = '" + req.body.email + "' WHERE ADMINISTRADOR = 'false' and ID_USUARIO = " + req.params.idUsuario;
    
        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected > 0)
            {
                alertaModulos=true;
                mensajeAlertaModulos="Usuario Actualizado";
                res.redirect('/administrador/usuarios');
            }
        })
    }
    catch(error)
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/usuarios/actualizar/' + req.params.idUsuario);
        }
        else
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/usuarios/actualizar/' + req.params.idUsuario);
        }
    }
});

router.get('/usuarios/eliminar/:idUsuario', function(req,res,next)
{
    let query= "delete from usuario where ADMINISTRADOR = 'false' and ID_USUARIO = " + req.params.idUsuario;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Usuario Eliminado";
            res.redirect('/administrador/usuarios');
        }        
    })
});

router.get('/usuarios/buscar', function(req,res,next)
{
    //res.render('Administrador/productos', {administrador:req.user})
    let query= "select * from usuario where ADMINISTRADOR = 'false' and NOMBRE like '%" + req.query.nombreBuscar + "%'";
    sql.query(query, (respuestaQuery)=>
    {
        busqueda=true;
        resultadosBusqueda=respuestaQuery.recordset;
        res.redirect('./')
    })
});

router.get('/productos', function(req,res,next)
{
    res.render('Administrador/productos', {administrador:req.user, alertaModulos:alertaModulos, mensajeAlertaModulos:mensajeAlertaModulos, busqueda:busqueda, resultadosBusqueda:resultadosBusqueda})
    alertaModulos=false;
    mensajeAlertaModulos="";
    busqueda=false;
    resultadosBusqueda=null;
});

router.get('/productos/crear', checkAuthenticated, function(req,res,next)
{
    res.render('Administrador/crear-producto', { error: alertaModulos, mensajeError: mensajeAlertaModulos });
    alertaModulos = false;
    mensajeAlertaModulos = "";
});

router.post('/productos/crear', checkAuthenticated, upload.single('imagen'), async function(req,res,next)
{
    let body = Object.create(req.body);
    Object.setPrototypeOf(req.body, Object.prototype);
    console.log(req.body)
    let parametrosDeseados =
    {
        nombre : {type: "string", maxLength: 15, minLength: 1},
        precio : {type: "double", minLength: 1},
        cantidad : {type: "int", minLength: 1},
        marca : {type: "string", maxLength: 15, minLength: 1},
        descripcion : {type: "string", maxLength: 120, minLength: 1}
    };
    
    try 
    {
        await verificator.Validate(parametrosDeseados, req.body);
        var query="insert into producto (NOMBRE, PRECIO, CANTIDAD, MARCA, DESCRIPCION) " +
        "values ('" + req.body.nombre + "', " + req.body.precio + ", " + req.body.cantidad + "," +
        "'" + req.body.marca + "', '" + req.body.descripcion + "')";

        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected > 0)
            {
                query = "SELECT ID_SKU FROM PRODUCTO WHERE NOMBRE = '" + req.body.nombre + "' AND MARCA = '" + req.body.marca  + "' AND PRECIO = " + req.body.precio + " " +
                "AND CANTIDAD = " + req.body.cantidad + " AND DESCRIPCION = '" +  req.body.descripcion + "'";
                sql.query(query, (respuestaQuery)=>
                {
                    let basePath =path.dirname(require.main.filename);
                    fs.rename(basePath + "/temp/" + req.file.filename , basePath + "/public/images/productos/" + respuestaQuery.recordset[0].ID_SKU + ".jpg", (error)=>
                    {
                        if(error)
                        {
                            console.log(error);
                        }
                        else
                        {
                            alertaModulos=true;
                            mensajeAlertaModulos="Producto Creado";
                            res.redirect('./');
                        }
                    });   
                });
            }       
        });
    }
    catch(error)
    {
        console.log(error);
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/productos/crear');
        }
        else
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/productos/crear');
        }
    }
});

router.get('/productos/actualizar/:idProducto',checkAuthenticated, function(req,res,next)
{
    let query= "select * from producto where ID_SKU = " + req.params.idProducto;
    sql.query(query, (respuestaQuery)=>
    {
        res.render('Administrador/actualizar-producto', { producto:respuestaQuery.recordset[0], error: alertaModulos, mensajeError: mensajeAlertaModulos });
        alertaModulos = false;
        mensajeAlertaModulos = "";
    })
});

router.post('/productos/actualizar/:idProducto', checkAuthenticated, async function(req,res,next)
{
    let parametrosDeseados =
    {
        nombre : {type: "string", maxLength: 15, minLength: 1},
        precio : {type: "double", minLength: 1},
        cantidad : {type: "int", minLength: 1},
        marca : {type: "string", maxLength: 15, minLength: 1},
        descripcion : {type: "string", maxLength: 120, minLength: 1}
    };
    
    try 
    {
        await verificator.Validate(parametrosDeseados, req.body);

        let query= "UPDATE PRODUCTO SET NOMBRE = '" + req.body.nombre + "', PRECIO = " + req.body.precio + ", " +
        "CANTIDAD = " + req.body.cantidad + ", MARCA = '" + req.body.marca + "', DESCRIPCION = '" + req.body.descripcion + "' WHERE ID_SKU = " + req.params.idProducto;
        
        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected > 0)
            {
                alertaModulos=true;
                mensajeAlertaModulos="Producto Actualizado";
                res.redirect('/administrador/productos');
            }       
        });
    }
    catch(error)
    {
        console.log(error);
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/productos/actualizar/' + req.params.idProducto);
        }
        else
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/productos/actualizar/' + req.params.idProducto);
        }
    }
});

router.get('/productos/eliminar/:idProducto', function(req,res,next)
{
    let query= "delete from producto where ID_SKU = " + req.params.idProducto;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Producto Eliminado";
            res.redirect('/administrador/productos');
        }        
    })
});

router.get('/productos/buscar', function(req,res,next)
{
    //res.render('Administrador/productos', {administrador:req.user})
    let query= "select * from producto where NOMBRE like '%" + req.query.nombreBuscar + "%'";
    sql.query(query, (respuestaQuery)=>
    {
        busqueda=true;
        resultadosBusqueda=respuestaQuery.recordset;
        res.redirect('./')
    })
});

router.get('/empleados', function(req,res,next)
{
    res.render('Administrador/empleados', {administrador:req.user, alertaModulos:alertaModulos, mensajeAlertaModulos:mensajeAlertaModulos, busqueda:busqueda, resultadosBusqueda:resultadosBusqueda})
    alertaModulos=false;
    mensajeAlertaModulos="";
    busqueda=false;
    resultadosBusqueda=null;
});

router.get('/empleados/crear', function(req,res,next)
{
    res.render('Administrador/crear-empleado', { error: alertaModulos, mensajeError: mensajeAlertaModulos });
    alertaModulos = false;
    mensajeAlertaModulos = "";
});

router.post('/empleados/crear', async function(req,res,next)
{
    let parametrosDeseados =
    {
        nombre : {type: "string", maxLength: 15, minLength: 1},
        apellidoPaterno : {type: "string", maxLength: 15, minLength: 1},
        apellidoMaterno : {type: "string", maxLength: 15, minLength: 1},
        email : {type: "email", maxLength: 30, minLength: 1},
        password : {type: "string", maxLength: 30, minLength: 1}
    };
    
    try 
    {
        await verificator.Validate(parametrosDeseados, req.body);
        var query="insert into usuario (NOMBRE, APELLIDO_P, APELLIDO_M, EMAIL, CONTRASENIA, ADMINISTRADOR) " +
        "values ('" + req.body.nombre + "', '" + req.body.apellidoPaterno + "', '" + req.body.apellidoMaterno + "'," +
        "'" + req.body.email + "', '" + req.body.password + "', 'true')";

        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected > 0)
            {
                alertaModulos=true;
                mensajeAlertaModulos="Empleado Creado";
                res.redirect('./');
            }
            
        })
    }
    catch(error)
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/empleados/crear');
        }
        else
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/empleados/crear');
        }
    }
});

router.get('/empleados/actualizar/:idEmpleado', function(req,res,next)
{
    let query= "select * from usuario where ADMINISTRADOR = 'true' and ID_USUARIO = " + req.params.idEmpleado;
    sql.query(query, (respuestaQuery)=>
    {

        res.render('Administrador/actualizar-empleado', { empleado:respuestaQuery.recordset[0], error: alertaModulos, mensajeError: mensajeAlertaModulos });
        alertaModulos = false;
        mensajeAlertaModulos = "";
    })
});

router.post('/empleados/actualizar/:idEmpleado', async function(req,res,next)
{
    let parametrosDeseados =
    {
        nombre : {type: "string", maxLength: 15, minLength: 1},
        apellidoPaterno : {type: "string", maxLength: 15, minLength: 1},
        apellidoMaterno : {type: "string", maxLength: 15, minLength: 1},
        email : {type: "email", maxLength: 30, minLength: 1},
        password : {type: "string", maxLength: 30, minLength: 1}
    };
    
    try 
    {
        await verificator.Validate(parametrosDeseados, req.body);
        let query= "UPDATE USUARIO SET NOMBRE = '" + req.body.nombre + "', APELLIDO_P = '" + req.body.apellidoPaterno + "', " +
        "APELLIDO_M = '" + req.body.apellidoMaterno + "', EMAIL = '" + req.body.email + "' WHERE ADMINISTRADOR = 'true' and ID_USUARIO = " + req.params.idEmpleado;
        
        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected > 0)
            {
                alertaModulos=true;
                mensajeAlertaModulos="Empleado Actualizado";
                res.redirect('/administrador/empleados');
            }       
        });
    }
    catch(error)
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/empleados/actualizar/' + req.params.idEmpleado);
        }
        else
        {
            alertaModulos = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/empleados/actualizar/' + req.params.idEmpleado);
        }
    }
});

router.get('/empleados/eliminar/:idEmpleado', function(req,res,next)
{
    let query= "delete from usuario where ADMINISTRADOR = 'true' and ID_USUARIO = " + req.params.idEmpleado;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Empleado Eliminado";
            res.redirect('/administrador/empleados');
        }        
    })
});

router.get('/empleados/buscar', function(req,res,next)
{
    //res.render('Administrador/productos', {administrador:req.user})
    let query= "select * from usuario where ADMINISTRADOR = 'true' and NOMBRE like '%" + req.query.nombreBuscar + "%'";
    sql.query(query, (respuestaQuery)=>
    {
        busqueda=true;
        resultadosBusqueda=respuestaQuery.recordset;
        res.redirect('./')
    })
});

module.exports = router;