if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const port = process.env.port || 3000;
const bcrypt = require('bcrypt');
const passport = require('passport');

const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    );



const users = [];

//setting view engine to ejs. Uses views dir as default
app.set('view engine', 'ejs');

//form data
app.use(express.urlencoded({ extended: false}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    //res.send('hello there...');
    res.render('index.ejs', { name: req.user.name });
});

//get register dir
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
});
//post register dir
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
    //console.log(users);
});

//get login dir
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});
//post login dir
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
})

//check user authentication
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}


//test Router setup
const testRouter = require('./routes/testRoute');
app.use('/testroute', testRouter);

//serve static files from public dir
app.use('/public', express.static('public'));

//setting port to 3000 from port var
app.listen(port, () => {
    console.log(`listening on port ${port}...`);
});
