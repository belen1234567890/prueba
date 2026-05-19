const express = require('express')
const req = require('express/lib/request')
const sqlite = require('sqlite3')

const app = express()

//*******  Configuraciones  */
app.set('view engine', 'ejs')


//******  Middleware ************/
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))


//****** Conexión a base de datos ********/
const base_datos = new sqlite.Database('datos.db', sqlite.OPEN_READWRITE, (error) => {
    if (error) {
        console.log('Error al conectarse a la base de datos')
    } else {
        console.log('Se conecto a la base de datos con exito')
    }
})


//*******  Rutas  ***********/
app.get('/', (req, res) => {
    let sql = 'select productos.id, nombre, marcas.marca, precio, ' +
        ' stock from productos, marcas where productos.marca = marcas.id '
    base_datos.all(sql, (error, resultado) => {
        if (error) {
            console.log('Error en la consulta a la base de datos')
        } else {
            sql = 'select * from marcas'
            base_datos.all(sql, (error, marcas) => {
                if (error) {
                    console.log('error al obtener las marcas')
                } else {
                    res.render('principal.ejs', { resultado, marcas })
                }
            })
        }
    })
})

app.post('/nuevo', (req, res) => {
    const { nombre, marca, precio, stock } = req.body
    const sql = 'insert into productos (nombre, marca, precio, stock) values (?,?,?,?)'
    base_datos.run(sql, [nombre, marca, precio, stock], (error) => {
        if (error) {
            console.log('Error al insertar nuevo producto')
        } else {
            res.redirect('/')
        }
    })
})

app.get('/eliminar', (req, res) => {
    const id = req.query.id
    const sql = 'delete from productos where id=?'
    base_datos.run(sql, [id], (error) => {
        if (error) {
            console.log('Error al eliminar el producto')
        } else {
            res.redirect('/')
        }
    })
})

app.get('/editar', (req, res) => {
    const id = req.query.id
    let sql = 'select * from productos where id =?'
    base_datos.all(sql, [id], (error, fila) => {
        if (error) {
            console.log('Error al consultar el producto')
        } else {
            sql = "select * from marcas"
            base_datos.all(sql, (error, marca) => {
                if (error) {
                    console.log('error al consultar marcas')
                } else
                {
                    res.render('editar.ejs',{ fila, marca })
                }
            })
        }
    })
})

app.post('/editar', (req, res) => {
    const { id, nombre, marca, precio, stock } = req.body
    const sql = "update productos set nombre=?, marca=?, precio=?, stock=? where id=?"
    base_datos.run(sql, [nombre, marca, precio, stock, id], (error) => {
        if (error) {
            console.log('Error al actualizar el producto')
        } else {
            res.redirect('/')
        }
    })
})
app.post('/buscar', (req, res) => {
    const nombre = req.body.nombre + '%'
    let sql = 'select productos.id, nombre, marcas.marca, precio, ' +
        ' stock from productos, marcas where productos.marca = marcas.id ' +
        ' and nombre like ?'
    //const  sql = "select * from productos  where nombre like ?"//
    base_datos.all(sql, [nombre], (error, resultado) => {
        if (error) {
            console.log('Error al consultar ')
        } else {
            sql = 'select * from marcas'
            base_datos.all(sql, (error) => {
                if (error) {
                    console.log('error al obtener las marcas')
                } else {

                    res.render('principal.ejs', { resultado, marcas })
                }
            })
        }
    })
})

app.get('/marcas', (req, res) => {
    const sql = 'select * from marcas order by marca'
    base_datos.all(sql, (error, filas) => {
        if (error) {
            console.log('error al consultar la DB')
        } else {
            res.render('marcas.ejs', { filas })
        }
    })
})
app.post('/nueva_marca', (req, res) => {
    const marca = req.body.marca
    const sql = 'insert into marcas (marca) values (?)'
    base_datos.run(sql, [marca], (error) => {
        if (error) {
            console.log('error al insertar nueva marca')
        } else {
            res.redirect('/marcas')
        }
    })
})
app.get('/editar_marca', (req, res) => {
    const id = req.query.id
    const sql = 'select * from marcas where id=?'
    base_datos.all(sql, [id], (error, fila) => {
        if (error) {
            console.log('Error al coonsultar la marca')
        } else {
            res.render('editar_marca.ejs', { fila })
        }
    })
})

app.post('/editar_marca', (req, res) => {
    const { id, marca } = req.body
    const sql = "update marcas set  marca=?  where id=?"
    base_datos.run(sql, [marca, id], (error) => {
        if (error) {
            console.log('Error al actualizar la  marca')
        } else {
            res.redirect('/marcas')
        }
    })
})
app.get('/eliminar_marca', (req, res) => {
    const id = req.query.id
    const sql = 'delete from marcas where id=?'
    base_datos.run(sql, [id], (error) => {
        if (error) {
            console.log('Error al eliminar la marca')
        } else {
            res.redirect('/marcas')
        }
    })
})


//******** Ejecución del servidor */
app.listen(3000, () => {
    console.log('El servidor se ejecutó con exito')
})