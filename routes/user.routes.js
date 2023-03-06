require('dotenv/config');
const express = require('express');
const bycrypt = require('bcryptjs');
const router = express.Router();
const {User} = require('../models/user.model')
const jwt = require('jsonwebtoken');
const moongose = require("mongoose");

router.post(`/`, async (req, res) => {
    const user = new User( {
        name: req.body.name,
        email: req.body.email,
        passwordHash: bycrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });
    const newUser = await user.save();

    if (!newUser)
        return res.status(500).send('The user cannot be created!');

    res.send(newUser);
});

router.get('/', async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
});

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res.status(500).json({success: false})
    }
    res.send(user);
});

router.get(`/get/count`, async (req, res) => {
  const usersCount = await User.countDocuments();
  if (!usersCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    usersCount: usersCount,
  });
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bycrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            }
            , process.env.SECRET,
            {expiresIn: '1d'}
        );
        res.status(200).send({user: user.email, token: token});
    } else {
        res.send('Password is wrong');
    }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  if (!moongose.isValidObjectId(id)) {
    res.status(400).send("Invalid Product Id");
  }
  try {
    const user = await User.findByIdAndRemove(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "The user with the given ID was not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "The user is deleted!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error,
    });
  }
});

module.exports = router;