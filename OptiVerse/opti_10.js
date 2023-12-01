//first
const express = require('express');
const session = require('express-session');
const mysql = require("mysql");
const qs = require("querystring");
const fs = require("fs");
const path = require('path');

//second
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "optiverse",
    port: 3307,
});
//third
var app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//this will make all the public folder files static, 
//so we dont have to use the app.get() for forgotpassword and terms and conditions.
app.use(express.static('public')); 

//fourth
app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
}));

//sixth
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query('SELECT * FROM userposts', (err, result) => {
                connection.release();
                if (err) throw err;
                res.render('homepage', {posts: result});
            });
        });
    } else {
        res.sendFile(__dirname + '/loginpage.html');
    }
});

// fifth, routes
app.post('/', (req, res) => {
    let formdata = "";
    req.on("data", (chunk) => {
        formdata += chunk;
    });

    req.on("end", () => {
        const data = qs.parse(formdata);

        const query = "SELECT * FROM users WHERE email = ? AND password = ?";
        const values = [data.uemail, data.upass];
        req.session.usermail = data.uemail;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(query, values, (err, result) => {
                connection.release();   

                if (err) throw err;

                if (result.length > 0) {
                    req.session.loggedIn = true;
                    res.redirect('/');//to sixth
                } else {
                    res.send("User is not registered");
                }
            });
        });
    });
});
// fifth, routes
app.post('/post-thought', (req, res) => {
    let formdata = "";
    req.on("data", (chunk) => {
        formdata += chunk;
    });

    req.on("end", () => {
        const data = qs.parse(formdata);

        const query = "INSERT INTO userposts (username, post) VALUES (?, ?)";
        const values = [req.session.usermail, data.thought]; // replace 'req.session.username' with the actual username

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(query, values, (err, result) => {
                connection.release();

                if (err) throw err;

                res.redirect('/');
            });
        });
    });
});
app.post('/register', (req, res) => {
    let formdata = "";
    req.on("data", (chunk) => {
        formdata += chunk;
    });

    req.on("end", () => {
        const data = qs.parse(formdata);

        const query = "INSERT INTO users (email, password) VALUES (?, ?)";
        const values = [data.email, data.password]; // Note: This is not secure for production

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(query, values, (err, result) => {
                connection.release();

                if (err) throw err;

                res.redirect('/');
            });
        });
    });
});
app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

//search filter
//search filter
app.get('/search', (req, res) => {
    const query = req.query.query;
    pool.getConnection((err, connection) => {
        if (err) throw err;
        // use the new query with full-text search
        connection.query('SELECT * FROM userposts WHERE MATCH(post) AGAINST(? IN NATURAL LANGUAGE MODE) AS score ORDER BY score DESC', [query], (err, result) => {
            connection.release();
            if (err) throw err;
            res.render('search', {posts: result});
        });
    });
});


// sixth
app.listen(1200, () => {  
    console.log("Server is listening on port 1200");
});
