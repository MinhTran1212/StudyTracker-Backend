import mongoose from 'mongoose';
import { User } from '../models/User';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser){
            return res.status(400).json({error: "This email already existed. Please try to login."})
        }
        const newUser = await User.create({
            email,
            password
        });

        const secretKey = process.env.JWT_SECRET;
        if (!secretKey){
            return res.status(500).json({error: "JWT_SECRET is not defined"});
        }

        const token = jwt.sign(
            { userId: newUser._id },
            secretKey,
            { expiresIn: '7d'}
        );

        res.status(201).json({message: "Sign up successfully!", token: token});
    } catch (error){
        console.error(error);
        res.status(500).json({error: "Registeration failed."});
    }

});

router.post('/login', async (req, res) => {
    const bcrypt = require('bcrypt');
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email});
        if (!user){
            return res.status(401).json({error: "Invalid email or password."});
        } 
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(401).json({error: "Invalid email or password."});
        }
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey){
            return res.status(500).json({error: "JWT_SECRET is not defined."});
        }
        const token = jwt.sign(
            { userId: user._id },
            secretKey,
            { expiresIn: '7d' }
        );
        res.status(200).json({message: "Login successfully", token: token});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Registeration failed."})
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.send('User deleted successfully');
    } catch (error){
        res.status(500).send(error);
    }
});

router.get('/users', async (req, res) => {
    const users = await User.find().select("id email");
    res.status(500).json(users);
});

export default router;
