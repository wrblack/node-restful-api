const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const router = express.Router();

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const JWT_KEY = 'super-secret';

router.post('/signup', (req, res, next) => {

    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'User with that email already exists.'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ err });
                    } else {
                        const user = new User({
                            _id: mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
            
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User created'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json(err)
                            });
                    }
                });
            }
        });
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({ message: 'Auth failed' });
            }

            bcrypt.compare(req.body.password, user[0].password, (err, same) => {
                if (err) {
                    return res.status(401).json({ message: 'Auth failed' });
                }

                if (same) {

                    const token = jwt.sign({
                        email: user[0],
                        userId: user._id
                    }, JWT_KEY, {
                        expiresIn: '1h'
                    });

                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
                }

                res.status(401).json({ message: 'Auth failed' });
            });
        })
        .catch(err => res.status(500).json(err));
});

router.delete('/:userId', (req, res, next) => {
    User.deleteOne({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({ message: "User deleted" });
        })
        .catch(err => res.status(400).json({ err }));
});

module.exports = router;