var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var expressValidator = require("express-validator");
var mongo = require("mongojs");
var db = mongo('customerapp', ["users"]);
var ObjectId = mongo.ObjectId;

var app = express();

/*
var logger =  function(req, res, next) {
  console.log('Logging...');
  next();
}

app.use(logger);
*/

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Global vars
app.use(function (req, res, next) {
  res.locals.errors = null;
  next();
});

//Express validator middleware
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

var people = [
  {
    name: "Rohith",
    age: 10
  },
  {
    name: "Surya",
    age: 12
  }
];

app.get("/api", function (req, res) {
  res.json(people);
});

app.get("/sample", function (req, res) {
  res.send("sample content serving");
});

app.get("/ejs", function (req, res) {
  db.users.find(function (err, docs) {
    res.render("index", {
      body: "Receiving EJS",
      users: docs
    });
    // console.log(docs);
  });
});

app.post("/users/add", function (req, res) {
  req.checkBody("first_name", "First name is Required").notEmpty();
  req.checkBody("last_name", "Last name is Required").notEmpty();
  req.checkBody("email", "email is Required").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    db.users.find(function (err, docs) {
      res.render("index", {
        body: "Receiving EJS",
        users: docs,
        errors: errors
      });
    });
  } else {
    var newUser = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email
    };

    db.users.insert(newUser, function (err, result) {
      if (err) {
        console.log(err);
      }
      res.redirect('/ejs');

    });
  }
});

app.delete('/users/delete/:id', function (req, res) {
  db.users.remove({_id: ObjectId(req.params.id)}, function (err, result) {
    if(err){
      console.log(err);
    }
    res.redirect('/ejs');
  });
  console.log(req.params.id);
 });

app.listen(8089, function () {
  console.log("Server running on port 8089...");
});
