const express = require('express');
const router = express.Router();
const sql = require('../helpers/databaseManager');
let verificator = require('../handlers/verificator');
const multer = require('multer');
const path = require('path');
let upload = multer({dest: path.dirname(require.main.filename) + "/temp/"});
const fs = require('fs');


let alertaModulos=false;
let alertaError=false;
let mensajeAlertaModulos="";
let busqueda=false;
let resultadosBusqueda=null;

function checkAuthenticated(req, res, next) 
{
    if (req.isAuthenticated()) 
    {
        if(req.user.ADMINISTRADOR === false)
        {
           res.redirect('/inicio');
        }
        return next();
    }
    res.redirect("/login");
}

router.get('/inicio', checkAuthenticated, function(req,res,next)
{
    res.render('Administrador/inicio', {administrador:req.user})
});

router.get('/usuarios', checkAuthenticated, function(req,res,next)
{
    res.render('Administrador/usuarios', {administrador:req.user, alertaModulos:alertaModulos, mensajeAlertaModulos:mensajeAlertaModulos, busqueda:busqueda, resultadosBusqueda:resultadosBusqueda, error: alertaError, mensajeError: mensajeAlertaModulos})
    alertaModulos=false;
    alertaError=false;
    mensajeAlertaModulos="";
    busqueda=false;
    resultadosBusqueda=null;
});

router.get('/usuarios/crear', checkAuthenticated, function(req,res,next)
{
    res.render('Administrador/crear-usuario', {error: alertaError, mensajeError: mensajeAlertaModulos});
    alertaError = false;
    mensajeAlertaModulos = "";
});

router.post('/usuarios/crear', checkAuthenticated, async function(req,res,next)
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

        let query = "SELECT * FROM USUARIO WHERE EMAIL = '" + req.body.email + "'";
        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected[0] === 0)
            {
                query="insert into usuario (NOMBRE, APELLIDO_P, APELLIDO_M, EMAIL, CONTRASENIA, ADMINISTRADOR) " +
                "values ('" + req.body.nombre + "', '" + req.body.apellidoPaterno + "', '" + req.body.apellidoMaterno + "'," +
                "'" + req.body.email + "', '" + req.body.password + "', 'false')";

                sql.query(query, (respuestaQuery)=>
                {
                    if(respuestaQuery.rowsAffected[0] > 0)
                    {
                        alertaModulos=true;
                        mensajeAlertaModulos="Usuario Creado";
                        res.redirect('./');
                    }
                    else
                    {
                        alertaError = true;
                        mensajeAlertaModulos = "Hubo un error al intentar crear al usuario";
                        res.redirect('/administrador/usuarios/crear');
                    }
                });
            }
            else
            {
                alertaError = true;
                mensajeAlertaModulos = "Ya hay un usuario registrado con este correo. Por favor ingrese otro.";
                res.redirect('/administrador/usuarios/crear');
            }
        });
    } 
    catch (error) 
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/usuarios/crear');
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/usuarios/crear');
        }
    }
});

router.get('/usuarios/actualizar/:idUsuario', checkAuthenticated, function(req,res,next)
{
    let query= "select * from usuario where ID_USUARIO = " + req.params.idUsuario;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.recordset.length > 0)
        {
            res.render('Administrador/actualizar-usuario', { usuario:respuestaQuery.recordset[0], error: alertaError, mensajeError : mensajeAlertaModulos });
            alertaError = false;
            mensajeAlertaModulos = "";
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos += " Hubo un error al intentar obtener la información del usuario solicitado";
            res.redirect('/administrador/usuarios');
        }
    });
});

router.post('/usuarios/actualizar/:idUsuario', checkAuthenticated, async function(req,res,next)
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

        let query = "SELECT * FROM USUARIO WHERE EMAIL = '" + req.body.email + "'";
        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected[0] === 0 || respuestaQuery.recordset[0].ID_USUARIO == req.params.idUsuario)
            {
                let query= "UPDATE USUARIO SET NOMBRE = '" + req.body.nombre + "', APELLIDO_P = '" + req.body.apellidoPaterno + "', " +
                "APELLIDO_M = '" + req.body.apellidoMaterno + "', EMAIL = '" + req.body.email + "' WHERE ADMINISTRADOR = 'false' and ID_USUARIO = " + req.params.idUsuario;
            
                sql.query(query, (respuestaQuery)=>
                {
                    if(respuestaQuery.rowsAffected[0] > 0)
                    {
                        alertaModulos=true;
                        mensajeAlertaModulos="Usuario Actualizado";
                        res.redirect('/administrador/usuarios');
                    }
                    else
                    {
                        alertaError = true;
                        mensajeAlertaModulos = "Hubo un error al intentar actualizar el usuario.";
                        res.redirect('/administrador/usuarios/actualizar/' + req.params.idUsuario);
                    }
                });
            }
            else
            {
                alertaError = true;
                mensajeAlertaModulos = "No se puede actualizar al usuario, porque otro usuario ya posee ese correo, por favor use otro.";
                res.redirect('/administrador/usuarios/actualizar/' + req.params.idUsuario);
            }
        });
    }
    catch(error)
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/usuarios/actualizar/' + req.params.idUsuario);
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/usuarios/actualizar/' + req.params.idUsuario);
        }
    }
});

router.get('/usuarios/eliminar/:idUsuario', checkAuthenticated, function(req,res,next)
{
    let query= "delete from usuario where ADMINISTRADOR = 'false' and ID_USUARIO = " + req.params.idUsuario;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected[0] > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Usuario Eliminado";
            res.redirect('/administrador/usuarios');
        }
        else
        {
            alertaError=true;
            mensajeAlertaModulos="Hubo un error al intentar eliminar el usuario";
            res.redirect('/administrador/usuarios');
        }
    })
});

router.get('/usuarios/buscar', checkAuthenticated,  function(req,res,next)
{
    let query= "select * from usuario where ADMINISTRADOR = 'false' and NOMBRE like '%" + req.query.nombreBuscar + "%'";
    sql.query(query, (respuestaQuery)=>
    {
        busqueda=true;
        resultadosBusqueda=respuestaQuery.recordset;
        res.redirect('./')
    })
});

router.get('/productos',checkAuthenticated, function(req,res,next)
{
    res.render('Administrador/productos', {administrador:req.user, alertaModulos:alertaModulos, mensajeAlertaModulos:mensajeAlertaModulos, busqueda:busqueda, resultadosBusqueda: resultadosBusqueda, error: alertaError, mensajeError: mensajeAlertaModulos })
    alertaModulos=false;
    alertaError=false;
    mensajeAlertaModulos="";
    busqueda=false;
    resultadosBusqueda=null;
});

router.get('/productos/crear', checkAuthenticated, function(req,res,next)
{
    res.render('Administrador/crear-producto', { error: alertaError, mensajeError: mensajeAlertaModulos });
    alertaError = false;
    mensajeAlertaModulos = "";
});

router.post('/productos/crear', checkAuthenticated, async function(req,res,next)
{
    let parametrosDeseados =
    {
        nombre : {type: "string", maxLength: 60, minLength: 1},
        precio : {type: "double", minLength: 1},
        cantidad : {type: "int", minLength: 1},
        marca : {type: "string", maxLength: 60, minLength: 1},
        descripcion : {type: "string", maxLength: 120, minLength: 1},
        imagen: {type: "string", minLength: 1},
    };
    
    try 
    {
        await verificator.Validate(parametrosDeseados, req.body);
        var query="SELECT * FROM producto " +
        "WHERE nombre = '" + req.body.nombre + "' AND marca = '" + req.body.marca + "' AND descripcion = '" + req.body.descripcion + "'";

        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected[0] === 0)
            {
                query="insert into producto (NOMBRE, PRECIO, CANTIDAD, MARCA, DESCRIPCION, IMAGEN) " +
                "values ('" + req.body.nombre + "', " + req.body.precio + ", " + req.body.cantidad + "," +
                "'" + req.body.marca + "', '" + req.body.descripcion + "', '" + req.body.imagen + "')";

                sql.query(query, (respuestaQuery)=>
                {
                    if(respuestaQuery.rowsAffected[0] > 0)
                    {
                        alertaModulos=true;
                        mensajeAlertaModulos="Producto Creado";
                        res.redirect('./');
                    }
                    else
                    {
                        alertaError = true;
                        mensajeAlertaModulos = "Hubo un error al intentar crear al producto";
                        res.redirect('/administrador/productos/crear');
                    }   
                });
            }
            else
            {
                alertaError = true;
                mensajeAlertaModulos = "No se puede crear el producto, puesto que ya existe.";
                res.redirect('/administrador/productos/crear');
            }
        });
        
    }
    catch(error)
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/productos/crear');
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/productos/crear');
        }
    }
});

router.get('/productos/actualizar/:idProducto', checkAuthenticated, function(req,res,next)
{
    let query= "select * from producto where ID_SKU = " + req.params.idProducto;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.recordset.length > 0)
        {
            res.render('Administrador/actualizar-producto', { producto:respuestaQuery.recordset[0], error: alertaError, mensajeError: mensajeAlertaModulos });
            alertaModulos = false;
            mensajeAlertaModulos = "";
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos += " Hubo un error al intentar obtener la información del producto solicitado";   
            res.redirect('/administrador/productos');
        }
    })
});

router.post('/productos/actualizar/:idProducto', checkAuthenticated, async function(req,res,next)
{
    let parametrosDeseados =
    {
        nombre : {type: "string", maxLength: 60, minLength: 1},
        precio : {type: "double", minLength: 1},
        cantidad : {type: "int", minLength: 1},
        marca : {type: "string", maxLength: 60, minLength: 1},
        descripcion : {type: "string", maxLength: 120, minLength: 1},
        imagen: {type: "string", minLength: 1}
    };
    
    try 
    {
        await verificator.Validate(parametrosDeseados, req.body);

        let query="SELECT * FROM producto " +
        "WHERE nombre = '" + req.body.nombre + "' AND marca = '" + req.body.marca + "' AND descripcion = '" + req.body.descripcion + "'";

        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected[0] === 0 || respuestaQuery.recordset[0].ID_SKU == req.params.idProducto)
            {
                let query= "UPDATE PRODUCTO SET NOMBRE = '" + req.body.nombre + "', PRECIO = " + req.body.precio + ", IMAGEN = '" + req.body.imagen + "', " +
                "CANTIDAD = " + req.body.cantidad + ", MARCA = '" + req.body.marca + "', DESCRIPCION = '" + req.body.descripcion + "' WHERE ID_SKU = " + req.params.idProducto;
                
                sql.query(query, (respuestaQuery)=>
                {
                    if(respuestaQuery.rowsAffected[0] > 0)
                    {
                        alertaModulos=true;
                        mensajeAlertaModulos="Producto Actualizado";
                        res.redirect('/administrador/productos');
                    }       
                    else
                    {
                        alertaError = true;
                        mensajeAlertaModulos = "Hubo un error al intentar actualizar el producto.";
                        res.redirect('/administrador/productos/actualizar/' + req.params.idProducto);
                    }
                });
            }
            else
            {
                alertaError = true;
                mensajeAlertaModulos = "No se puede actualizar el producto, puesto que ya existe un producto con dichas características. Intente con otras características (nombre, marca y descripción)";
                res.redirect('/administrador/productos/actualizar/' + req.params.idProducto);
            }
        });
    }
    catch(error)
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/productos/actualizar/' + req.params.idProducto);
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/productos/actualizar/' + req.params.idProducto);
        }
    }
});

router.get('/productos/eliminar/:idProducto', checkAuthenticated, function(req,res,next)
{
    let query= "delete from producto where ID_SKU = " + req.params.idProducto;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected[0] > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Producto Eliminado";
            res.redirect('/administrador/productos');
        }
        else
        {
            alertaError=true;
            mensajeAlertaModulos="Hubo un error al intentar eliminar el producto";
            res.redirect('/administrador/productos');
        }
    })
});

router.get('/productos/buscar', checkAuthenticated, function(req,res,next)
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

router.get('/empleados', checkAuthenticated, function(req,res,next)
{
    res.render('Administrador/empleados', {administrador:req.user, alertaModulos:alertaModulos, mensajeAlertaModulos:mensajeAlertaModulos, busqueda:busqueda, resultadosBusqueda:resultadosBusqueda, error:alertaError, mensajeError: mensajeAlertaModulos})
    alertaModulos=false;
    alertaError=false;
    mensajeAlertaModulos="";
    busqueda=false;
    resultadosBusqueda=null;
});

router.get('/empleados/crear', checkAuthenticated, function(req,res,next)
{
    res.render('Administrador/crear-empleado', { error: alertaError, mensajeError: mensajeAlertaModulos });
    alertaError = false;
    mensajeAlertaModulos = "";
});

router.post('/empleados/crear', checkAuthenticated, async function(req,res,next)
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

        let query = "SELECT * FROM USUARIO WHERE EMAIL = '" + req.body.email + "'";
        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected[0] === 0)
            {
                query="insert into usuario (NOMBRE, APELLIDO_P, APELLIDO_M, EMAIL, CONTRASENIA, ADMINISTRADOR) " +
                "values ('" + req.body.nombre + "', '" + req.body.apellidoPaterno + "', '" + req.body.apellidoMaterno + "'," +
                "'" + req.body.email + "', '" + req.body.password + "', 'true')";

                sql.query(query, (respuestaQuery)=>
                {
                    if(respuestaQuery.rowsAffected[0] > 0)
                    {
                        alertaModulos=true;
                        mensajeAlertaModulos="Empleado Creado";
                        res.redirect('./');
                    }
                    else
                    {
                        alertaError = true;
                        mensajeAlertaModulos = "Hubo un error al intentar crear a el empleado";
                        res.redirect('/administrador/empleados/crear');
                    }  
                });
            }
            else
            {
                alertaError = true;
                mensajeAlertaModulos = "Ya hay un empleado registrado con este correo. Por favor ingrese otro.";
                res.redirect('/administrador/empleados/crear');
            }
        });
    }
    catch(error)
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/empleados/crear');
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/empleados/crear');
        }
    }
});

router.get('/empleados/actualizar/:idEmpleado', checkAuthenticated, function(req,res,next)
{
    let query= "select * from usuario where ADMINISTRADOR = 'true' and ID_USUARIO = " + req.params.idEmpleado;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.recordset.length > 0)
        {
            res.render('Administrador/actualizar-empleado', { empleado:respuestaQuery.recordset[0], error: alertaError, mensajeError: mensajeAlertaModulos });
            alertaError = false;
            mensajeAlertaModulos = "";
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos += " Hubo un error al intentar obtener la información del empleado solicitado"
            res.redirect('/administrador/empleados');
        }
    })
});

router.post('/empleados/actualizar/:idEmpleado', checkAuthenticated, async function(req,res,next)
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

        let query = "SELECT * FROM USUARIO WHERE EMAIL = '" + req.body.email + "'";
        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected[0] === 0 || respuestaQuery.recordset[0].ID_USUARIO == req.params.idEmpleado)
            {
                let query= "UPDATE USUARIO SET NOMBRE = '" + req.body.nombre + "', APELLIDO_P = '" + req.body.apellidoPaterno + "', " +
                "APELLIDO_M = '" + req.body.apellidoMaterno + "', EMAIL = '" + req.body.email + "' WHERE ADMINISTRADOR = 'true' and ID_USUARIO = " + req.params.idEmpleado;
                
                sql.query(query, (respuestaQuery)=>
                {
                    if(respuestaQuery.rowsAffected[0] > 0)
                    {
                        alertaModulos=true;
                        mensajeAlertaModulos="Empleado Actualizado";
                        res.redirect('/administrador/empleados');
                    }
                    else
                    {
                        alertaError = true;
                        mensajeAlertaModulos = "Hubo un error al intentar actualizar a el empleado";
                        res.redirect('/administrador/empleados/actualizar/' + req.params.idEmpleado);   
                    }
                });
            }
            else
            {
                alertaError = true;
                mensajeAlertaModulos = "No se puede actualizar al empleado, porque otro usuario ya posee ese correo, por favor use otro.";
                res.redirect('/administrador/empleados/actualizar/' + req.params.idEmpleado);
            }
        });
    }
    catch(error)
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/empleados/actualizar/' + req.params.idEmpleado);
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/empleados/actualizar/' + req.params.idEmpleado);
        }
    }
});

router.get('/empleados/eliminar/:idEmpleado', checkAuthenticated, function(req,res,next)
{
    let query= "delete from usuario where ADMINISTRADOR = 'true' and ID_USUARIO = " + req.params.idEmpleado;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected[0] > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Empleado Eliminado";
            res.redirect('/administrador/empleados');
        }
        else
        {
            alertaError=true;
            mensajeAlertaModulos="Hubo un error al intentar eliminar a el empleado";
            res.redirect('/administrador/empleados');
        }
    })
});

router.get('/empleados/buscar', checkAuthenticated, function(req,res,next)
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

router.get('/tips', checkAuthenticated, function(req,res,next)
{
    res.render('Administrador/tips', {administrador:req.user, alertaModulos:alertaModulos, mensajeAlertaModulos:mensajeAlertaModulos, busqueda:busqueda, resultadosBusqueda:resultadosBusqueda, error:alertaError, mensajeError: mensajeAlertaModulos})
    alertaModulos=false;
    alertaError=false;
    mensajeAlertaModulos="";
    busqueda=false;
    resultadosBusqueda=null;
});

router.get('/tips/crear', checkAuthenticated, function(req,res,next)
{
    res.render('Administrador/crear-tip', { error: alertaError, mensajeError: mensajeAlertaModulos });
    alertaError = false;
    mensajeAlertaModulos = "";
});

router.post('/tips/crear', checkAuthenticated, async function(req,res,next)
{
    let parametrosDeseados =
    {
        titulo : {type: "string", maxLength: 128, minLength: 1},
        cuerpo : {type: "string", minLength: 1},
        bullet: {type: "string", minLength: 1}
    };
    
    try 
    {
        await verificator.Validate(parametrosDeseados, req.body);

        let query = "INSERT INTO TIP (TITULO, BULLET, CUERPO) VALUES('" + req.body.titulo + "', '" + req.body.bullet + "', '" + req.body.cuerpo + "')";
        sql.query(query, function(respuestaQuery)
        {
            console.log(respuestaQuery);
            if(respuestaQuery.rowsAffected[0] > 0)
            {
                alertaModulos=true;
                mensajeAlertaModulos="Tip agregado";
                res.redirect('/administrador/tips');
            }
            else
            {
                console.log(respuestaQuery);
                alertaError = true;
                mensajeAlertaModulos = "Hubo un error al intentar crear a el tip";
                res.redirect('/administrador/tips/crear');
            }
        });
    }
    catch(error)
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/tips/crear');
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/tips/crear');
        }
    }
});

router.get('/tips/actualizar/:idTip', checkAuthenticated, function(req,res,next)
{
    let query= "select * from tip where ID_TIP = " + req.params.idTip;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.recordset.length > 0)
        {
            res.render('Administrador/actualizar-tip', { tip: respuestaQuery.recordset[0], error: alertaError, mensajeError: mensajeAlertaModulos });
            alertaError = false;
            mensajeAlertaModulos = "";
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos += " Hubo un error al intentar obtener la información del tip solicitado"
            res.redirect('/administrador/tips');
        }
    })
});

router.post('/tips/actualizar/:idTip', checkAuthenticated, async function(req,res,next)
{
    let parametrosDeseados =
    {
        titulo : {type: "string", maxLength: 128, minLength: 1},
        cuerpo : {type: "string", minLength: 1},
        bullet : {type: "string", minLength: 1},
    };

    try 
    {
        await verificator.Validate(parametrosDeseados, req.body);

        let query = "SELECT * FROM TIP WHERE TITULO = '" + req.body.nombre + "'";
        sql.query(query, (respuestaQuery)=>
        {
            if(respuestaQuery.rowsAffected[0] === 0 || respuestaQuery.recordset[0].ID_TIP == req.params.idTip)
            {
                let query= "UPDATE TIP SET TITULO = '" + req.body.titulo + "', CUERPO = '" + req.body.cuerpo + "', BULLET = '" + req.body.bullet + "' WHERE ID_TIP = " + req.params.idTip;
                
                sql.query(query, (respuestaQuery)=>
                {
                    if(respuestaQuery.rowsAffected[0] > 0)
                    {
                        alertaModulos=true;
                        mensajeAlertaModulos="Tip Actualizado";
                        res.redirect('/administrador/tips');
                    }
                    else
                    {
                        alertaError = true;
                        mensajeAlertaModulos = "Hubo un error al intentar actualizar a el tip";
                        res.redirect('/administrador/tips/actualizar/' + req.params.idTip);   
                    }
                });
            }
            else
            {
                alertaError = true;
                mensajeAlertaModulos = "No se puede actualizar al tip, porque otro tip ya posee ese titulo, por favor use otro.";
                res.redirect('/administrador/tips/actualizar/' + req.params.idTip);
            }
        });
    }
    catch(error)
    {
        if(error.hasOwnProperty('expectedMaxLength'))
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto su tamaño máximo es de ' + error.expectedMaxLength + " carácteres";
            res.redirect('/administrador/tips/actualizar/' + req.params.idTip);
        }
        else
        {
            alertaError = true;
            mensajeAlertaModulos = 'El campo ' + error.propertyName + ' es incorrecto';
            res.redirect('/administrador/tips/actualizar/' + req.params.idTip);
        }
    }
});

router.get('/tips/eliminar/:idTip', checkAuthenticated, function(req,res,next)
{
    let query= "delete from tio where ID_TIP = " + req.params.idTip;
    sql.query(query, (respuestaQuery)=>
    {
        if(respuestaQuery.rowsAffected[0] > 0)
        {
            alertaModulos=true;
            mensajeAlertaModulos="Tip Eliminado";
            res.redirect('/administrador/tips');
        }
        else
        {
            alertaError=true;
            mensajeAlertaModulos="Hubo un error al intentar eliminar a el tip";
            res.redirect('/administrador/tips');
        }
    })
});

router.get('/tips/buscar', checkAuthenticated, function(req,res,next)
{
    let query= "select * from tip where TITULO like '%" + req.query.nombreBuscar + "%'";
    sql.query(query, (respuestaQuery)=>
    {
        busqueda=true;
        resultadosBusqueda=respuestaQuery.recordset;
        res.redirect('./')
    })
});

module.exports = router;