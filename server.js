const express = require('express'); // importing a CommonJS module
const morgan = require('morgan');
const helmet = require('helmet');

const hubsRouter = require('./hubs/hubs-router.js');

const server = express();

// middleware before routers, being used globally
server.use(logger)
// server.use(gatekeeper('melon'))
server.use(helmet());
server.use(morgan('short'));
server.use(express.json()); // built-in middleware

// server.use('/api/hubs', hubsRouter);
server.use('/api/hubs', gatekeeper('hubspw'), hubsRouter); // using MW locally - will execute gatekeeper before going to hubs router

server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

module.exports = server;

// If you want to write middleware with arrow functions, they need to be declared before the use(mw), otherwise write as normal functions

// Normally MW is written in a separate file, and is then required in the server

function logger(req, res, next) { 
  console.log(req.method, req.originalUrl, 'req.query', req.query);
  next(); // call next to pass the data on to the next mw, otherwise it stops here - can also use next with an arg to jump to another mw
};

// write and use middleware to
// - read a 'pass' header from req.query
// - if pw is melon, let req continue
// - else status 400

function gatekeeper(pass) { // Needs to return the actual MW function so express can use it - remember to invoke and pass in a pw arg

  return function(req, res, next) { // function gatekeeper

    // const {pass} = req.query;
  
    if (req.query.pass === pass) {
      next(); // empty args in next will call the next Normal MW
    } else {
      // res.status(400).json({message: 'Incorrect password'});
      next('any value - next just needs to be invoked with an arg, and express will consider THIS value to be the "err"')
    };
  };

};

// Error handling - express will look at MW with 4 args to be an error handler - mw(err, req, res, next)
server.use((err, req, res, next) => {
  res.status(400).json({msg: err})
});