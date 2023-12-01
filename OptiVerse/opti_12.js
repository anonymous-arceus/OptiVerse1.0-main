//first
const express = require('express');
const session = require('express-session');
const mysql = require("mysql");
const qs = require("querystring");
const fs = require("fs");
const path = require('path');
const bodyParser = require('body-parser');

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
//for time
function timeDifference(current, previous) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed/1000) + 's';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed/msPerMinute) + 'm';
    } else if (elapsed < msPerDay ) {
        return Math.round(elapsed/msPerHour) + 'h';
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + 'd';
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + 'mo';
    } else {
        return Math.round(elapsed/msPerYear) + 'y';
    }
}

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
                res.render('homepage', {posts: result, timeDifference: timeDifference});
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
        const date = Math.floor(Date.now() / 1000); // get current timestamp

        // Extract hashtags from the post content
        const hashtags = data.thought.match(/#\w+/g);

        const query1 = "INSERT INTO userposts (username, post, date) VALUES (?, ?, FROM_UNIXTIME(?))";
        const values1 = [req.session.usermail, data.thought, date]; // replace 'req.session.username' with the actual username

        pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(query1, values1, (err, result) => {
                if (err) throw err;
            
                // If there are hashtags, store them in the other table
                if (hashtags) {
                    const query2 = "INSERT INTO tags (post_id, tag) VALUES ?";
                    const values2 = hashtags.map(tag => [result.insertId, tag]); // 'result.insertId' is the ID of the inserted post
                    connection.query(query2, [values2], (err, result) => {
                        connection.release();
                        if (err) throw err;
                    });
                } else {
                    connection.release();
                }
            
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
//your posts
app.get('/your-posts', (req, res) => {
    if (req.session.loggedIn) {
        const query = "SELECT * FROM userposts WHERE username = ?";
        const values = [req.session.usermail];
        pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(query, values, (err, result) => {
                connection.release();
                if (err) throw err;
                res.render('homepage', {posts: result, timeDifference: timeDifference});
            });
        });
    } else {
        res.sendFile(__dirname + '/loginpage.html');
    }
});

//search filter
app.get('/search', function(req, res) {
    var query = req.query.query;

    pool.getConnection(function(err, connection) {
        if (err) throw err;

        connection.query('SELECT * FROM userposts WHERE post LIKE ?', ['%' + query + '%'], function(err, results) {
            connection.release();
            if (err) throw err;

            res.render('homepage', { posts: results }); // render the main page with the search results
        });
    });
});


// sixth
app.listen(1200, () => {  
    console.log("Server is listening on port 1200");
});