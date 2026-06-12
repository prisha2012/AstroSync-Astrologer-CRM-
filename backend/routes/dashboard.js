const express = require('express');
const Client = require('../models/Client');
const Consultation = require('../models/Consultation');
const FollowUp = require('../models/FollowUp');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const astrologerId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalClients,
      newClientsThisMonth,
      totalConsultations,
      consultationsThisMonth,
      consultationsLastMonth,
      pendingFollowUps,
      overdueFollowUps,
      revenueThisMonth,
      upcomingConsultations,
      recentConsultations,
      consultationsByType,
      monthlyRevenue
    ] = await Promise.all([
      Client.countDocuments({ astrologer: astrologerId }),
      Client.countDocuments({ astrologer: astrologerId, createdAt: { $gte: startOfMonth } }),
      Consultation.countDocuments({ astrologer: astrologerId }),
      Consultation.countDocuments({ astrologer: astrologerId, date: { $gte: startOfMonth }, status: 'Completed' }),
      Consultation.countDocuments({ astrologer: astrologerId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: 'Completed' }),
      FollowUp.countDocuments({ astrologer: astrologerId, status: 'Pending' }),
      FollowUp.countDocuments({ astrologer: astrologerId, status: 'Overdue' }),
      Consultation.aggregate([
        { $match: { astrologer: astrologerId, date: { $gte: startOfMonth }, status: 'Completed', paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$fee' } } }
      ]),
      Consultation.find({ astrologer: astrologerId, date: { $gte: now }, status: 'Scheduled' })
        .populate('client', 'name zodiacSign')
        .sort({ date: 1 })
        .limit(5),
      Consultation.find({ astrologer: astrologerId, status: 'Completed' })
        .populate('client', 'name zodiacSign')
        .sort({ date: -1 })
        .limit(5),
      Consultation.aggregate([
        { $match: { astrologer: astrologerId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Consultation.aggregate([
        { $match: { astrologer: astrologerId, status: 'Completed', paymentStatus: 'Paid' } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            revenue: { $sum: '$fee' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 }
      ])
    ]);

    res.json({
      totalClients,
      newClientsThisMonth,
      totalConsultations,
      consultationsThisMonth,
      consultationsLastMonth,
      pendingFollowUps,
      overdueFollowUps,
      revenueThisMonth: revenueThisMonth[0]?.total || 0,
      upcomingConsultations,
      recentConsultations,
      consultationsByType,
      monthlyRevenue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
