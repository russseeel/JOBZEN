const db = require('../config/database');

exports.createApplication = async (req, res) => {
    try {
        const {
            advertisement_id,
            applicant_name,
            applicant_email,
            applicant_phone,
            cover_letter,
            resume_url
        } = req.body;

        if (!advertisement_id || !applicant_name || !applicant_email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const [ads] = await db.query(
            'SELECT id, status FROM advertisements WHERE id = ?',
            [advertisement_id]
        );

        if (ads.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found'
            });
        }

        if (ads[0].status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'This job posting is no longer accepting applications'
            });
        }

        const applicant_id = req.user ? req.user.id : null;

        const [result] = await db.query(`
            INSERT INTO applications
            (advertisement_id, applicant_id, applicant_name, applicant_email,
             applicant_phone, cover_letter, resume_url, status, email_sent)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', FALSE)
        `, [
            advertisement_id,
            applicant_id,
            applicant_name,
            applicant_email,
            applicant_phone,
            cover_letter,
            resume_url
        ]);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: result.insertId
        });
    } catch (error) {
        console.error('Create application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const { advertisement_id, company_id, status, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT app.*,
                   ad.title as job_title,
                   c.name as company_name,
                   c.id as company_id
            FROM applications app
            LEFT JOIN advertisements ad ON app.advertisement_id = ad.id
            LEFT JOIN companies c ON ad.company_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (company_id) {
            query += ' AND c.id = ?';
            params.push(parseInt(company_id));
        }

        if (advertisement_id) {
            query += ' AND app.advertisement_id = ?';
            params.push(advertisement_id);
        }

        if (status) {
            query += ' AND app.status = ?';
            params.push(status);
        }

        query += ' ORDER BY app.applied_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [applications] = await db.query(query, params);

        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const [applications] = await db.query(`
            SELECT app.*,
                   ad.title as job_title,
                   ad.full_description as job_description,
                   c.name as company_name
            FROM applications app
            LEFT JOIN advertisements ad ON app.advertisement_id = ad.id
            LEFT JOIN companies c ON ad.company_id = c.id
            WHERE app.id = ?
        `, [id]);

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            data: applications[0]
        });
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const [result] = await db.query(
            'UPDATE applications SET status = ?, notes = ? WHERE id = ?',
            [status, notes, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            message: 'Application status updated successfully'
        });
    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM applications WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        console.error('Delete application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const [applications] = await db.query(`
            SELECT app.*,
                   ad.title as job_title,
                   c.name as company_name,
                   c.logo_url
            FROM applications app
            LEFT JOIN advertisements ad ON app.advertisement_id = ad.id
            LEFT JOIN companies c ON ad.company_id = c.id
            WHERE app.applicant_id = ?
            ORDER BY app.applied_at DESC
        `, [req.user.id]);

        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error('Get my applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
