const express = require('express')
const app = express()
const sqlite = require('sqlite')
const BodyParser = require('body-parser')

const port = process.env.PORT || 3000
const path = require('path')

const dbConnection = sqlite.open(path.resolve(__dirname, 'banco.sqlite'), {Promise})

app.set("views", path.join(__dirname, "views"))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(BodyParser.urlencoded({extended: false}))

app.get('/', async (request, response) => {
    const db = await dbConnection
    const DBcategorias = await db.all('select * from categorias')
    const vagas = await db.all('select * from vagas')
    const categorias = DBcategorias.map( cat => {
        return {
            ...cat,
            vagas: vagas.filter( vaga => vaga.categoria === cat.id)
        }
    })
 
    response.render('home', {categorias})
})

app.get('/vaga/:id', async (request, response) => {
    const db = await dbConnection
    const vaga = await db.get(`select * from vagas where id=${request.params.id}`)
    
    response.render('vaga',{
        vaga
    })
})

app.get('/admin', async (req, res) => {
    res.render('admin/home')
})

app.get('/admin/categorias', async (req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/categorias', {categorias})
})

app.get('/admin/categorias/nova', async (req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-categoria', {categorias})
})

app.post('/admin/categorias/nova', async (req,res) => {
    const db = await dbConnection
    const {categoria} = req.body
    await db.run(`insert into categorias(categoria) values('${categoria}')`)
    res.redirect('/admin/categorias')

})

app.get('/admin/categorias/delete/:id', async (req, res) => {
    const db = await dbConnection
    const categorias = await db.run('delete from categorias where id = ' + req.params.id)
    res.redirect('/admin/categorias')
})

app.post('/admin/categorias/editar/:id', async (req, res) => {
    const db = await dbConnection
    const {categoria} = req.body
    await db.run(`update categorias set categoria='${categoria}' where id = ${req.params.id}`)
    res.redirect('/admin/categorias')
})

app.get('/admin/categorias/editar/:id', async (req, res) => {
    const db = await dbConnection
    const categoria = await db.get('select * from categorias where id = ' + req.params.id)
    res.render('admin/editar-categoria', {
        categoria
    })
})

app.get('/admin/vagas', async (req, res) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas')
    res.render('admin/vagas', {vagas})
})

app.get('/admin/vagas/delete/:id', async (req,res) => {
    const db = await dbConnection
    const vagas = await db.run('delete from vagas where id =' + req.params.id + '')
    res.redirect('/admin/vagas')

})

app.get('/admin/vagas/nova', async (req,res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')    
    res.render('admin/nova-vaga', {
        categorias
    })

})

app.post('/admin/vagas/nova', async (req,res) => {
    const db = await dbConnection
    const {titulo, descricao, categoria} = req.body
    await db.run(`insert into vagas(titulo, descricao, categoria) values('${titulo}','${descricao}',${categoria})`)
    res.redirect('/admin/vagas')

})

app.get('/admin/vagas/editar/:id', async (req,res) => {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id=' + req.params.id)
    const categorias = await db.all('select * from categorias')    
    res.render('admin/editar-vaga', {
        categorias,
        vaga
    })
})

app.post('/admin/vagas/editar/:id', async (req,res) => {
    const db = await dbConnection
    const {titulo, descricao, categoria} = req.body
    const id = req.params.id
    await db.run(`update vagas set titulo='${titulo}', descricao='${descricao}', categoria= ${categoria} where id= ${id}`)
    res.redirect('/admin/vagas')

})


const init = async () => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT)')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT)')

//    const vaga = 'Marketing Digital(San Francisco)'
//    const descricao = 'Vaga para Marketing Digital fulltime em San Franciso.'
    //await db.run(`insert into categorias(categoria) values('${categoria}')`)
//    await db.run(`insert into vagas(categoria, titulo, descricao) values(2, '${vaga}', '${descricao}')`)
}

init()

app.listen(port, (err) => {

    if(err){
        console.log('Não foi possível iniciar o servidor do Jobify')
    }else{
        console.log('Servidor jobify rodando...')
    }

})
