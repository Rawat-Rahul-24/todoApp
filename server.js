let express = require('express')
let mongoose = require('mongoose');
let mongodb = require('mongodb')
let bodyParser = require('body-parser');
let sanitizeHtml = require('sanitize-html')

let app = express()
let connectionString = process.env.URI
let db
let port = process.env.PORT
if(port == null || port == ""){
  port = 8080
}

mongoose.connect(connectionString, { useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true });
db = mongoose.connection
db.on('error', console.log.bind(console, "connection error"))
db.once('open', function(callback){
  app.listen(port)
  console.log("connection succeeded")
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))

function passwordProtection(req, res, next){
  res.set('WWW-Authenticate', 'Basic realm="Simple To do App"')
  //console.log(req.headers.authorization)
  if(req.headers.authorization == "Basic bGVhcm5KUzpuZXdMZWFybmVy"){
    next()
  }else{
    res.status(401).send("Authentication required")
  }
  
}

app.use(passwordProtection)
//home page
app.get('/',  function(req, res){
  db.collection('items').find().toArray(function(err, items) {
      res.send(`
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
</head>
<body>
  <div class="container">
    <h1 class="display-4 text-center py-1">To-Do App</h1>
    
    <div class="jumbotron p-3 shadow-sm">
      <form id="create-form" action="/created-item" method="POST">
        <div class="d-flex align-items-center">
          <input id="new-item" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
          <button class="btn btn-primary">Add New Item</button>
        </div>
      </form>
    </div>
    
    <ul id="item-list" class="list-group pb-5">
      
    </ul>
    
  </div>
  <script>
  let items = ${JSON.stringify(items)}
  </script>
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <script src="/browser.js"></script>
</body>
</html>
    `)
    })
})

app.post('/created-item', function(req, res){
  let safeText = sanitizeHtml(req.body.name, {allowedTags: [], allowedAttributes: {}}) 
  db.collection('items').insertOne({name: safeText}, function(err, info){  
      res.json(info.ops[0])
    })  
});

app.post('/update-item', function(req, res){
  let safeText = sanitizeHtml(req.body.name, {allowedTags: [], allowedAttributes: {}})
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {name: safeText}}, function(){
    res.send("Success")
  })
})

app.post('/delete-item', function(req, res){
  db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, function(){
    res.send("Success")
  })
})
  

