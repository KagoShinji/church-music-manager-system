import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Music, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const STATS = [
  { label: 'Songs in Library', value: '124', icon: Music,        desc: '+3 added this week'         },
  { label: 'Masses Planned',   value: '18',  icon: CheckCircle2, desc: 'This liturgical year'       },
  { label: 'Templates Saved',  value: '5',   icon: Calendar,     desc: '2 used this month'          },
  { label: 'Files Uploaded',   value: '47',  icon: TrendingUp,   desc: 'Audio & sheet music'        },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const today = new Date();

  const upcomingSunday = new Date();
  upcomingSunday.setDate(today.getDate() + (7 - today.getDay()) % 7 || 7);

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner stagger-1">
        <span className="hero-date-chip">
          <Clock size={13} />
          {format(today, 'EEEE, MMMM do, yyyy')}
        </span>
        <h1 className="hero-title">Good day, Choir Director</h1>
        <p className="hero-sub">Plan, organize, and manage your church music — all in one place.</p>
        <div className="flex gap-3 mt-6" style={{ position: 'relative' }}>
          <button className="btn btn-lg" style={{ background: 'white', color: 'var(--blue-700)' }} onClick={() => navigate('/planner')}>
            <Sparkles size={18} />
            Plan a Mass
          </button>
          <button
            className="btn btn-lg"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => navigate('/library')}
          >
            <Music size={18} />
            Song Library
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 stagger-2" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))', marginBottom: '2rem' }}>
        {STATS.map(({ label, value, icon: Icon, desc }) => (
          <div key={label} className="stat-card">
            <div className="stat-card-icon"><Icon size={20} /></div>
            <div className="flex-col gap-1">
              <div className="stat-card-label">{label}</div>
              <div className="stat-card-value">{value}</div>
              <div className="stat-card-desc">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Upcoming */}
      <div className="grid grid-cols-2 stagger-3" style={{ gridTemplateColumns: '1fr 1.6fr' }}>
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="flex-col gap-3">
            <button className="btn btn-primary w-full btn-lg" onClick={() => navigate('/planner')}>
              <Sparkles size={18} />
              Auto-Generate Lineup
            </button>
            <button className="btn btn-secondary w-full btn-lg" onClick={() => navigate('/library')}>
              <Music size={18} />
              Browse Song Library
            </button>
            <button className="btn btn-secondary w-full btn-lg" onClick={() => navigate('/files')}>
              <Calendar size={18} />
              Manage Files
            </button>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="card">
          <div className="card-header">
            <h3>Upcoming Schedule</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/calendar')}>View all</button>
          </div>

          <div className="flex-col gap-0">
            {[0, 7, 14].map((offset, i) => {
              const d = new Date(upcomingSunday);
              d.setDate(d.getDate() + offset);
              const isFirst = i === 0;
              return (
                <div
                  key={offset}
                  className="flex items-center justify-between"
                  style={{
                    padding: '0.875rem 0',
                    borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 46,
                      height: 46,
                      background: isFirst ? 'var(--primary)' : 'var(--gray-100)',
                      color: isFirst ? 'white' : 'var(--text-sub)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0,
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{format(d, 'MMM')}</span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1 }}>{format(d, 'd')}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Sunday Mass</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{format(d, 'EEEE, MMMM do')}</div>
                    </div>
                  </div>
                  <span className={`badge ${isFirst ? 'badge-warning' : 'badge-gray'}`}>
                    {isFirst ? 'Not Planned' : 'Upcoming'}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <button className="btn btn-primary w-full" onClick={() => navigate('/planner?auto=true')}>
              <Sparkles size={16} />
              Auto-Pilot Next Mass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
