const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../Models/UserModel');
const generateToken = require('../utils/generateToken');


const RegisterUser = async (req, res) => {

    try {
        let { name, age, email, password } = req.body;

        // if use check
        let finduser = await UserModel.findOne({ email: email });
        if (finduser) {
            return res.status(201).json({
                success: false,
                message: "Your Account Already Register. Please login!!!",
            });
        } else {

            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, async (err, hash) => {
                    if (err) {
                        return res.send(err.message);
                    }
                    else {
                        let user = await UserModel.create({
                            name,
                            age,
                            email,
                            password: hash,
                        })

                        let token = generateToken(user);
                        res.cookie('token', token);

                        return res.status(201).json({
                            success: true,
                            message: "User Registration successfully",
                            user: user,
                        });

                    }

                });
            });
        }
    }
    catch (err) {
        res.send(err.message);
    }
}


module.exports = {RegisterUser};