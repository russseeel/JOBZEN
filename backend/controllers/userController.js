const db = require('../config/database');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
    try {
        const { role, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT id, email, first_name, last_name, phone, role, company_id, created_at FROM people';
        const params = [];

        if (role) {
            query += ' WHERE role = ?';
            params.push(role);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await db.query(query, params);

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.query(
            'SELECT id, email, first_name, last_name, phone, role, company_id, created_at FROM people WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { email, password, first_name, last_name, phone, role, company_id } = req.body;

        if (!email || !password || !first_name || !last_name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const [existing] = await db.query('SELECT id FROM people WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO people (email, password_hash, first_name, last_name, phone, role, company_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [email, password_hash, first_name, last_name, phone, role, company_id]
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, first_name, last_name, phone, role, company_id } = req.body;

        const [result] = await db.query(
            'UPDATE people SET email = ?, first_name = ?, last_name = ?, phone = ?, role = ?, company_id = ? WHERE id = ?',
            [email, first_name, last_name, phone, role, company_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        const [result] = await db.query('DELETE FROM people WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
