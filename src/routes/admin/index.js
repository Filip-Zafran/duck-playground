import express from 'express';
import { authenticate, adminOnly } from '../../middleware/auth.js';

const router = express.Router();

// Get all applications
router.get('/applications', authenticate, adminOnly, (req, res) => {
  // TODO: Fetch applications from database
  res.json({
    applications: [
      // {
      //   id: 1,
      //   name: 'John Doe',
      //   email: 'john@example.com',
      //   status: 'pending',
      //   appliedAt: new Date(),
      //   interests: ['hiking', 'yoga']
      // }
    ]
  });
});

// Get single application
router.get('/applications/:id', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;
  // TODO: Fetch application from database
  res.json({
    id,
    message: 'Application details endpoint'
  });
});

// Approve application
router.post('/applications/:id/approve', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;
  // TODO: Update application status in database
  res.json({
    id,
    status: 'approved',
    message: 'Application approved'
  });
});

// Reject application
router.post('/applications/:id/reject', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  // TODO: Update application status in database
  res.json({
    id,
    status: 'rejected',
    reason,
    message: 'Application rejected'
  });
});

// Get dashboard stats
router.get('/stats', authenticate, adminOnly, (req, res) => {
  res.json({
    totalApplications: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    nextEventDate: new Date().toISOString()
  });
});

export default router;
