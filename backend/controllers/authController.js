const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, phone, role = 'applicant' } = req.body;

        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const [existingUser] = await db.query(
            'SELECT id FROM people WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO people (email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [email, password_hash, first_name, last_name, phone, role]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const [users] = await db.query(
            'SELECT id, email, password_hash, first_name, last_name, role, company_id FROM people WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                company_id: user.company_id
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                company_id: user.company_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, email, first_name, last_name, phone, role, company_id FROM people WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, phone } = req.body;

        await db.query(
            'UPDATE people SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
            [first_name, last_name, phone, req.user.id]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
