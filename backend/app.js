const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const routes = require('./routes/apiRoutes');
const {notFound, errorHandler} = require('./middleware/errorHandler');

const app = express();

if (env.nodeEnv === 'production') {
    app.set('trust proxy', 1);
}

app.use(helmet());
app.use(
    cors({
        origin: env.corsOrigin.split(',').map((o) => o.trim()),
        credentials: true
    })
);
app.use(express.json({limit: '1mb'}));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;