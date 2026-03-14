import React, { useState, useEffect } from 'react';
import { 
    Users, GraduationCap, Calendar, BookOpen, 
    ArrowUp, ArrowDown, RefreshCw, BarChart3, 
    Clock, Bell, CheckCircle2, TrendingUp,
    Shield
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import './SuperAdminDashboard.css';

const COLORS = ['#5BA4FC', '#F8BBD0', '#be185d', '#3b82f6'];

/* ── Animated Counter ── */
function Counter({ value, suffix = '', delay = 0 }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const timeout = setTimeout(() => {
            const end = Number(value) || 0;
            const duration = 1500;
            const startTime = Date.now();
            
            const animate = () => {
                const now = Date.now();
                const progress = Math.min((now - startTime) / duration, 1);
                const easeOutQuad = progress * (2 - progress);
                setDisplay(Math.floor(easeOutQuad * end));
                if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        }, delay);
        return () => clearTimeout(timeout);
    }, [value, delay]);

    return <span>{display.toLocaleString()}{suffix}</span>;
}

/* ── Stat Card ── */
function StatCard({ label, value, sub, icon: Icon, gradient, suffix = '', delay = 0 }) {
    return (
        <div className="sa-stat-card fade-in" style={{ background: gradient, animationDelay: `${delay}ms` }}>
            <div className="sa-stat-icon">
                <Icon size={24} />
            </div>
            <div className="sa-stat-body">
                <span className="sa-stat-label">{label}</span>
                <div className="sa-stat-value">
                    <Counter value={value} suffix={suffix} delay={delay + 200} />
                </div>
                {sub && <span className="sa-stat-sub">{sub}</span>}
            </div>
        </div>
    );
}

export default function SuperAdminDashboard({ user }) {
    const [isLoading, setIsLoading] = useState(false);

    // Dummy School Data for "WOW" effect
    const attendanceData = [
        { day: 'Mon', attendance: 92, staff: 98 },
        { day: 'Tue', attendance: 95, staff: 96 },
        { day: 'Wed', attendance: 91, staff: 100 },
        { day: 'Thu', attendance: 94, staff: 97 },
        { day: 'Fri', attendance: 88, staff: 95 },
        { day: 'Sat', attendance: 85, staff: 92 },
    ];

    const distributionData = [
        { name: 'Primary', value: 450 },
        { name: 'Secondary', value: 320 },
        { name: 'Higher Sec', value: 180 },
    ];

    return (
        <div className="sa-root">
            {/* ── Hero Header ── */}
            <div className="sa-hero">
                <div>
                    <div className="sa-live-badge">
                        <span className="sa-live-dot" />
                        ACADEMIC PORTAL ACTIVE
                    </div>
                    <h1 className="sa-hero-title">School Insights Overview</h1>
                    <p className="sa-hero-sub">
                        Welcome back, <strong>{user?.name || 'Headmaster'}</strong> · Everything looks good today.
                    </p>
                </div>
                <button className="sa-refresh-btn" onClick={() => window.location.reload()}>
                    <RefreshCw size={16} />
                    Refresh Analytics
                </button>
            </div>

            {/* ── Key Metrics ── */}
            <div className="sa-grid-4">
                <StatCard 
                    label="Total Students" 
                    value={1240} 
                    icon={GraduationCap} 
                    gradient="linear-gradient(135deg, #5BA4FC 0%, #3b82f6 100%)"
                    sub="+12 new admissions this week"
                />
                <StatCard 
                    label="Staff Presence" 
                    value={98} 
                    suffix="%"
                    icon={Users} 
                    gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    sub="48 out of 50 staff present"
                    delay={100}
                />
                <StatCard 
                    label="Avg. Attendance" 
                    value={94} 
                    suffix="%"
                    icon={Calendar} 
                    gradient="linear-gradient(135deg, #F8BBD0 0%, #f48fb1 100%)"
                    sub="Standard academic performance"
                    delay={200}
                />
                <StatCard 
                    label="Active Programs" 
                    value={24} 
                    icon={BookOpen} 
                    gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                    sub="Across all academic blocks"
                    delay={300}
                />
            </div>

            {/* ── Charts Section ── */}
            <div className="sa-charts-grid">
                <div className="sa-chart-card sa-chart-wide glass">
                    <div className="sa-chart-head">
                        <div>
                            <h3>Attendance Trend</h3>
                            <p className="sa-chart-sub">Student vs Staff presence (Last 6 Days)</p>
                        </div>
                        <TrendingUp size={20} style={{ opacity: 0.4 }} />
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={attendanceData}>
                            <defs>
                                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#5BA4FC" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#5BA4FC" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="day" fontSize={11} stroke="rgba(0,0,0,0.4)" />
                            <YAxis fontSize={11} stroke="rgba(0,0,0,0.4)" />
                            <Tooltip 
                                contentStyle={{ 
                                    background: 'rgba(255,255,255,0.95)', 
                                    border: '1px solid #5BA4FC', 
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(10px)'
                                }} 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="attendance" 
                                stroke="#5BA4FC" 
                                fill="url(#attGrad)" 
                                strokeWidth={3} 
                                name="Students %" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="sa-chart-card glass">
                    <div className="sa-chart-head">
                        <div>
                            <h3>Student Dist.</h3>
                            <p className="sa-chart-sub">By Academic Level</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Recent Activity ── */}
            <div className="sa-orders-card glass">
                <div className="sa-orders-header">
                    <div>
                        <h3>Recent Campus Activity</h3>
                        <p className="sa-chart-sub">Latest updates from staff and students</p>
                    </div>
                    <span className="sa-orders-count">4 New Events</span>
                </div>
                <div className="sa-table-wrap">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Activity Type</th>
                                <th>Subject/Identity</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="sa-table-row">
                                <td><span style={{ color: '#5BA4FC', fontWeight: 700 }}>Admission</span></td>
                                <td>New student: Aravind Swamy (Grade 5)</td>
                                <td className="sa-time">10:45 AM</td>
                                <td><span className="sa-live-badge" style={{ padding: '2px 10px' }}>Completed</span></td>
                            </tr>
                            <tr className="sa-table-row">
                                <td><span style={{ color: '#F8BBD0', fontWeight: 700 }}>Notice</span></td>
                                <td>Annual Sports Day Schedule Published</td>
                                <td className="sa-time">09:15 AM</td>
                                <td><span className="sa-live-badge" style={{ padding: '2px 10px', color: '#be185d' }}>Published</span></td>
                            </tr>
                            <tr className="sa-table-row">
                                <td><span style={{ color: '#10b981', fontWeight: 700 }}>Staff</span></td>
                                <td>Attendance marked for Block B</td>
                                <td className="sa-time">08:30 AM</td>
                                <td><span className="sa-live-badge" style={{ padding: '2px 10px', color: '#059669' }}>Verified</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
