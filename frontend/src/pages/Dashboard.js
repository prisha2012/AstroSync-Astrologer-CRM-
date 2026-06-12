import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#c9a84c','#7c5cbf','#c06080','#4caf82','#4c8ce8','#e8aa4c'];

const ZODIAC_MAP = {
  'Aries':'♈','Taurus':'♉','Gemini':'♊','Cancer':'♋','Leo':'♌','Virgo':'♍',
  'Libra':'♎','Scorpio':'♏','Sagittarius':'♐','Capricorn':'♑','Aquarius':'♒','Pisces':'♓'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div className="loading-spinner" />
      </div>
    </div>
  );

  const monthlyData = stats?.monthlyRevenue?.map(m => ({
    month: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    sessions: m.count
  })) || [];

  const pieData = stats?.consultationsByType?.slice(0, 6).map(t => ({
    name: t._id,
    value: t.count
  })) || [];

  const growth = stats?.consultationsLastMonth > 0
    ? (((stats.consultationsThisMonth - stats.consultationsLastMonth) / stats.consultationsLastMonth) * 100).toFixed(0)
    : null;

  return (
    <div>
      <div className="top-bar">
        <div>
          <div className="top-bar-title">Dashboard</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Namaste, <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span> ✦
        </div>
      </div>

      <div className="page-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card gold">
            <span className="stat-icon">♃</span>
            <div className="stat-label">Total Clients</div>
            <div className="stat-value">{stats?.totalClients || 0}</div>
            <div className="stat-change up">+{stats?.newClientsThisMonth || 0} this month</div>
          </div>
          <div className="stat-card violet">
            <span className="stat-icon">☽</span>
            <div className="stat-label">Sessions This Month</div>
            <div className="stat-value">{stats?.consultationsThisMonth || 0}</div>
            {growth !== null && (
              <div className={`stat-change ${parseFloat(growth) >= 0 ? 'up' : 'down'}`}>
                {parseFloat(growth) >= 0 ? '▲' : '▼'} {Math.abs(growth)}% vs last month
              </div>
            )}
          </div>
          <div className="stat-card rose">
            <span className="stat-icon">◎</span>
            <div className="stat-label">Pending Follow-ups</div>
            <div className="stat-value">{stats?.pendingFollowUps || 0}</div>
            {stats?.overdueFollowUps > 0 && (
              <div className="stat-change down">{stats.overdueFollowUps} overdue</div>
            )}
          </div>
          <div className="stat-card success">
            <span className="stat-icon">₹</span>
            <div className="stat-label">Revenue This Month</div>
            <div className="stat-value" style={{ fontSize: 24 }}>
              ₹{(stats?.revenueThisMonth || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-change">Paid consultations</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="dashboard-grid-3" style={{ marginBottom: 24 }}>
          {/* Revenue Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Revenue & Sessions</div>
                <div className="card-subtitle">Last 6 months</div>
              </div>
            </div>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="revenue" fill="var(--accent-gold)" radius={[4,4,0,0]} name="Revenue (₹)" />
                  <Bar dataKey="sessions" fill="var(--accent-violet)" radius={[4,4,0,0]} name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon">☽</div>
                <p>No data yet. Start logging consultations.</p>
              </div>
            )}
          </div>

          {/* Consultation Types */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">By Type</div>
                <div className="card-subtitle">All time</div>
              </div>
            </div>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                  {pieData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon">✦</div>
                <p>No consultations yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="dashboard-grid">
          {/* Upcoming */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Upcoming Sessions</div>
              <span className="badge badge-info">{stats?.upcomingConsultations?.length || 0}</span>
            </div>
            {stats?.upcomingConsultations?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.upcomingConsultations.map(c => (
                  <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="zodiac-avatar">{ZODIAC_MAP[c.client?.zodiacSign] || '✦'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{c.client?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.type}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--accent-gold)', fontWeight: 500 }}>{format(new Date(c.date), 'MMM d')}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(c.date), 'h:mm a')}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <div className="empty-state-icon">☽</div>
                <p>No upcoming sessions scheduled.</p>
              </div>
            )}
          </div>

          {/* Recent */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Sessions</div>
            </div>
            {stats?.recentConsultations?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.recentConsultations.map(c => (
                  <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="zodiac-avatar">{ZODIAC_MAP[c.client?.zodiacSign] || '✦'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{c.client?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.type}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${c.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {c.paymentStatus}
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{format(new Date(c.date), 'MMM d')}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <div className="empty-state-icon">✦</div>
                <p>No sessions recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
