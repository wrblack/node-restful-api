const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require("../models/product");
const Order = require('../models/order');

// GET
router.get('/', (req, res, next) => {
    Order.find()
        .select('_id quantity product')
        .populate('product', '_id name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'localhost:3000/orders/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({ err });
        });
});

// GET for product
router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate('product')
        .exec()
        .then(order => {
            if (! order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'localhost:3000/orders/' 
                }
            })
        })
        .catch(err => res.status(500).json({ err }));
});

// POST
router.post('/', checkAuth, (req, res, next) => {
    // validation
    Product.findById(req.body.productId)
        .then(product => {
            if (! product) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: product._id
            });

            return order
                .save()
                .then(result => {
                    res.status(201).json({
                        message: 'Created order successfully',
                        id: result._id,
                        createdOrder: {
                            _id: result._id,
                            product: result.product,
                            quantity: result.quantity
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + result._id
                        }
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                err
            });
        });
});

// DELETE
router.delete('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Order successfully deleted'
            });
        })
        .catch(err => {
            res.status(500).json({ err });
        })
})

module.exports = router;