const db = require('../config/database');

exports.getAllCompanies = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const [companies] = await db.query(
            'SELECT * FROM companies ORDER BY name ASC LIMIT ? OFFSET ?',
            [parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            count: companies.length,
            data: companies
        });
    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;

        const [companies] = await db.query('SELECT * FROM companies WHERE id = ?', [id]);

        if (companies.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        const [jobs] = await db.query(
            'SELECT id, title, short_description, location, working_time, posted_date FROM advertisements WHERE company_id = ? AND status = "active" ORDER BY posted_date DESC',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...companies[0],
                active_jobs: jobs
            }
        });
    } catch (error) {
        console.error('Get company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.createCompany = async (req, res) => {
    try {
        const { name, description, website, logo_url, location } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required'
            });
        }

        const [result] = await db.query(
            'INSERT INTO companies (name, description, website, logo_url, location) VALUES (?, ?, ?, ?, ?)',
            [name, description, website, logo_url, location]
        );

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, website, logo_url, location } = req.body;

        const [result] = await db.query(
            'UPDATE companies SET name = ?, description = ?, website = ?, logo_url = ?, location = ? WHERE id = ?',
            [name, description, website, logo_url, location, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.json({
            success: true,
            message: 'Company updated successfully'
        });
    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM companies WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.json({
            success: true,
            message: 'Company deleted successfully'
        });
    } catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
