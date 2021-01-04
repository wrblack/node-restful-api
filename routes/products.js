const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Product = require("../models/product");

const checkAuth = require("../middleware/check-auth");

// GET
router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };

            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({ err });
        });
});

// GET for product
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;

    Product.findById(id)
        .select('_id name price')
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(400).json({ message: 'Not a valid entry' });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
});

// POST
router.post('/', checkAuth, (req, res, next) => {

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });

    product.save().then(result => {
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                id: result._id,
                name: result.name,
                price: result.price,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            }
        });
    })
    .catch(err => {
        res.status(500).json({ error: err });
    });
});

// PATCH
router.patch('/:productId', checkAuth, (req, res, next) => {

    const id = req.params.productId;

    // figure out what to change
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Product.updateOne({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            if (result.ok == 1) {
                res.status(200).json({
                    message: 'Updated product successfully',
                    productId: id
                });
            } else {
                res.status(500).json({
                    message: 'There was an issue updating product ' + id
                });
            }
        })
        .catch(err => {
            res.status(500).json({ err });
        });
});

// DELETE
router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product successfully deleted'
            });
        })
        .catch(err => {
            res.status(500).json({ err });
        })
})

module.exports = router;