const express = require('express')

const routes = require('./routes')
const app = express();
const cors = require('cors');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors());
app.use('/uploadedImages', express.static('uploadedImages'));
app.use('/', routes)
app.listen(4001, () => {
    console.log(`Backend Server is running on port ${4001}.`);
});