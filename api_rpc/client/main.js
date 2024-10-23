const express = require('express');
const client = require('./index');

const app = express();

app.use(express.json());
app.use(express.static('public'));

// API endpoints
app.get('/api/products', (req, res) => {
    client.getProducts({}, (error, data) => {
        if (!error) {
            res.json(data);
        } else {
            res.status(500).json({ error: error.details });
        }
    });
});

app.get('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    client.getProductById({ product_id: id }, (error, data) => {
        if (!error) {
            res.json(data);
        } else {
            if (error.code === 5) { // NOT_FOUND
                res.status(404).json({ error: 'Producto no encontrado' });
            } else {
                res.status(500).json({ error: error.details });
            }
        }
    });
});

// Página web
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});