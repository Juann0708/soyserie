const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const SALT_I = 10
const jwt = require('jsonwebtoken')
const {Serie} = require('../server/models/Serie')
const {Resena} = require('./models/resena')
const { User } = require('./models/user')
const { auth } = require('./middelware/auth')

app.use(express.urlencoded({extended: true}))
app.use(express.json())
const port = process.env.PORT || 3001

require('dotenv').config()



mongoose.connect(process.env.DATABASE, { useNewUrlParser: true },(err) => {
    if(err) return err
    console.log("Conectado a MongoDB")
})

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())

//SERIES 

app.get('/Series/all', (req,res) => {
    Serie.find({}, (err, series) => {
        if(err) return res.status(400).send(err)
        res.status(200).send(series)
    })
})

app.post('/series/add', (req,res) => {
    const addserie =  new Serie(req.body)
    addserie.save((err,doc)=>{
        if(err) return res.json({succes: false, err})
        res.status(200).json({
            succes: true,
            addserie: doc
        })
    })
})

// RESEÑAS

app.post('/soyserie/resena', (req, res) => {
    const resena = new Resena(req.body)
    resena.save((err, doc) => {
        if(err) return res.json({success: false, err})
        res.status(200).json({
            success: true,
            resena: doc
        })
    })
})

/*app.put('/:id',async(req,res) => {
    const updateSerie = new Serie(req.body)
    await Task.findByIdAndUpdate(req.body,updateSerie)
    res.json({succes:true})
})*/



app.get('/soyserie/resenas', (req, res) => {
    Resena.find({}, (err, resena) => { 
        if(err) return res.status(400).send(err)
        res.status(200).send(resena)
    })
})

app.get("/soyserie/resena/:idresena", (req,res)=>{
    const idBuscar = req.params.idresena
    console.log(idBuscar)
    Resena.find({'idresena': idBuscar}).then(datos =>{
    res.send(datos)
    })
  })


  app.get('/soyserie/resena/articles', (req, res) => {
    let order = req.query.order ? req.query.order : 'desc'
    let sortBy = req.query.sortBy ? req.query.sortBy : 'general'
    let limit = req.query.limit ? parseInt(req.query.limit) : 100
    
    Product
    .find()
    .populate('resenas')    
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, resenas) => {
        if(err) return res.status(400).send(err)
        res.send(resenas)
    })
})


// USUARIOS

app.get('/users', (req, res) => {
    User.find({}, (err, users)=>{
      if(err) return res.status(400).send(err)
      res.status(200).send(users)
    }) 
  })
  
  //REGISTRO
  app.post('/users/register', (req, res) => {
      const user = new User(req.body)
      user.save((err, doc) => {
          if(err) return res.json({success: false, err})
          res.status(200).json({
              success: true,
              userdata: doc
          })
      })
  })
  
  //AUTENTIFICACION
  app.get('/users/auth', auth, (req, res) => {
      res.status(200).json({
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname
      })
    })
  
   //LOGIN 
    app.post('/api/users/login', (req, res) => {
      // 1. Encuentra el correo
          User.findOne({'email': req.body.email}, (err,user) => {
              if(!user) return res.json({loginSuccess: false, message: 'Auth fallida, email no encontrado'})
     
      // 2. Obtén el password y compruébalo
            user.comparePassword(req.body.password, (err, isMatch) => {
              if(!isMatch) return res.json({loginSuccess: false, message: "Password erróneo"})
    
     
      // 3. Si todo es correcto, genera un token
            user.generateToken((err, user)=> {
              if(err) return res.status(400).send(err)
          // Si todo bien, debemos guardar este token como un "cookie"
            res.cookie('soyserie_auth', user.token).status(200).json(
            {loginSuccess: true})
          })
        })
      })
    })
  
// 5. LISTENER

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`)
})
