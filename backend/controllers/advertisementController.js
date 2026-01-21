const db = require('../config/database');

exports.getAllAdvertisements = async (req, res) => {
    try {
        const { status = 'active', company_id, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT a.*, c.name as company_name, c.logo_url,
                   p.first_name, p.last_name, p.email as contact_email
            FROM advertisements a
            LEFT JOIN companies c ON a.company_id = c.id
            LEFT JOIN people p ON a.contact_person_id = p.id
            WHERE 1=1
        `;

        const params = [];

        if (company_id) {
            query += ' AND a.company_id = ?';
            params.push(parseInt(company_id));
        }

        if (status && status !== 'all') {
            query += ' AND a.status = ?';
            params.push(status);
        }

        query += ' ORDER BY a.posted_date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [advertisements] = await db.query(query, params);

        res.json({
            success: true,
            count: advertisements.length,
            data: advertisements
        });
    } catch (error) {
        console.error('Get advertisements error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getAdvertisementById = async (req, res) => {
    try {
        const { id } = req.params;

        const [advertisements] = await db.query(`
            SELECT a.*, c.name as company_name, c.description as company_description,
                   c.logo_url, c.website, c.location as company_location,
                   p.first_name, p.last_name, p.email as contact_email, p.phone as contact_phone
            FROM advertisements a
            LEFT JOIN companies c ON a.company_id = c.id
            LEFT JOIN people p ON a.contact_person_id = p.id
            WHERE a.id = ?
        `, [id]);

        if (advertisements.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found'
            });
        }

        res.json({
            success: true,
            data: advertisements[0]
        });
    } catch (error) {
        console.error('Get advertisement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.createAdvertisement = async (req, res) => {
    try {
        let {
            title, short_description, full_description, company_id,
            contact_person_id, wages, location, working_time,
            contract_type, required_skills, benefits, posted_date,
            application_deadline, status = 'active'
        } = req.body;

        if (req.user.role === 'company') {
            company_id = req.user.company_id;
        }

        if (!title || !short_description || !full_description || !company_id || !posted_date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const [result] = await db.query(`
            INSERT INTO advertisements
            (title, short_description, full_description, company_id, contact_person_id,
             wages, location, working_time, contract_type, required_skills, benefits,
             posted_date, application_deadline, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, short_description, full_description, company_id, contact_person_id,
            wages, location, working_time, contract_type, required_skills, benefits,
            posted_date, application_deadline, status
        ]);

        res.status(201).json({
            success: true,
            message: 'Advertisement created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Create advertisement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.updateAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;
        let {
            title, short_description, full_description, company_id,
            contact_person_id, wages, location, working_time,
            contract_type, required_skills, benefits, posted_date,
            application_deadline, status
        } = req.body;

        if (req.user.role === 'company') {
            const [ads] = await db.query('SELECT company_id FROM advertisements WHERE id = ?', [id]);
            if (ads.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Advertisement not found'
                });
            }
            if (ads[0].company_id !== req.user.company_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only edit your own advertisements.'
                });
            }
            company_id = req.user.company_id;
        }

        const [result] = await db.query(`
            UPDATE advertisements
            SET title = ?, short_description = ?, full_description = ?,
                company_id = ?, contact_person_id = ?, wages = ?, location = ?,
                working_time = ?, contract_type = ?, required_skills = ?,
                benefits = ?, posted_date = ?, application_deadline = ?, status = ?
            WHERE id = ?
        `, [
            title, short_description, full_description, company_id, contact_person_id,
            wages, location, working_time, contract_type, required_skills, benefits,
            posted_date, application_deadline, status, id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found'
            });
        }

        res.json({
            success: true,
            message: 'Advertisement updated successfully'
        });
    } catch (error) {
        console.error('Update advertisement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.deleteAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role === 'company') {
            const [ads] = await db.query('SELECT company_id FROM advertisements WHERE id = ?', [id]);
            if (ads.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Advertisement not found'
                });
            }
            if (ads[0].company_id !== req.user.company_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only delete your own advertisements.'
                });
            }
        }

        const [result] = await db.query('DELETE FROM advertisements WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found'
            });
        }

        res.json({
            success: true,
            message: 'Advertisement deleted successfully'
        });
    } catch (error) {
        console.error('Delete advertisement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
