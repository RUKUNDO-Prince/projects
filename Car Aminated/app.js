const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('./public'));

app.get('/', (req, res) => {
    console.log('Car started');
    res.status(200).sendFile(path.resolve(__dirname, './index.html'));
});

app.all('*', (req, res) => {
    console.log('Car lost');
    res.status(404).send('<h2>Sorry, file not available</h2>');
});

app.listen(3000, () => {
    console.log('Car server started listening on 3000...');
})