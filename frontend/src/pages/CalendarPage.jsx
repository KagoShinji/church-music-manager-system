import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSunday, isToday } from 'date-fns';

const MASSES = {
  '2026-04-12': { label: '2nd Sunday of Easter', status: 'planned' },
  '2026-04-19': { label: '3rd Sunday of Easter', status: 'planned' },
  '2026-04-26': { label: '4th Sunday of Easter', status: 'pending' },
  '2026-05-03': { label: '5th Sunday of Easter', status: 'pending' },
  '2026-05-10': { label: '6th Sunday of Easter', status: 'none' },
};

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart); // 0 = Sunday

  const sundays = days.filter(d => isSunday(d));

  return (
    <div>
      {/* Header */}
      <div className="page-header stagger-1">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">View, schedule, and manage your upcoming mass lineups.</p>
        </div>
        <button className="btn btn-primary btn-lg">
          <Plus size={18} />
          Schedule Mass
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Calendar Grid */}
        <div className="card stagger-2" style={{ padding: 0 }}>
          {/* Month Nav */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button className="btn btn-icon btn-secondary" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft size={18} />
              </button>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </button>
              <button className="btn btn-icon btn-secondary" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day Labels */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7,1fr)',
            borderBottom: '1px solid var(--border)',
          }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{
                padding: '0.6rem 0',
                textAlign: 'center',
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: d === 'Sun' ? 'var(--primary)' : 'var(--text-muted)',
              }}>{d}</div>
            ))}
          </div>

          {/* Day Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {/* Padding cells */}
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} style={{ minHeight: 80, borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />
            ))}

            {days.map((day, idx) => {
              const key = format(day, 'yyyy-MM-dd');
              const mass = MASSES[key];
              const isSun = isSunday(day);
              const isCurrentDay = isToday(day);
              const colPos = (startPad + idx) % 7;
              const isLastCol = colPos === 6;

              return (
                <div
                  key={key}
                  style={{
                    minHeight: 80,
                    padding: '0.5rem',
                    borderRight: isLastCol ? 'none' : '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    background: isCurrentDay ? 'var(--blue-50)' : 'transparent',
                    cursor: isSun ? 'pointer' : 'default',
                    transition: 'background var(--transition)',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (isSun) e.currentTarget.style.background = 'var(--primary-subtle)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isCurrentDay ? 'var(--blue-50)' : 'transparent'; }}
                >
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: isCurrentDay ? 800 : isSun ? 600 : 400,
                    color: isCurrentDay ? 'var(--white)' : isSun ? 'var(--primary)' : 'var(--text-sub)',
                    width: 24, height: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCurrentDay ? 'var(--primary)' : 'transparent',
                  }}>
                    {format(day, 'd')}
                  </div>

                  {mass && (
                    <div style={{
                      marginTop: '0.35rem',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.35rem',
                      background: mass.status === 'planned' ? 'var(--primary)' : mass.status === 'pending' ? '#fef3c7' : 'var(--gray-100)',
                      color:      mass.status === 'planned' ? 'white'          : mass.status === 'pending' ? '#92400e'  : 'var(--text-muted)',
                      lineHeight: 1.4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {mass.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Upcoming Sundays */}
        <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Legend */}
          <div className="card stagger-2" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Legend</div>
            <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { color: 'var(--primary)', bg: 'var(--primary)', label: 'Lineup Planned', textColor: 'white' },
                { color: '#92400e', bg: '#fef3c7', label: 'Pending Review', textColor: '#92400e' },
                { color: 'var(--text-muted)', bg: 'var(--gray-100)', label: 'No Lineup Yet', textColor: 'var(--text-muted)' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div style={{ width: 12, height: 12, background: item.bg, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Sundays List */}
          <div className="card stagger-3" style={{ padding: 0 }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Upcoming Sundays</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sundays.slice(0, 5).map((sunday, i) => {
                const key = format(sunday, 'yyyy-MM-dd');
                const mass = MASSES[key];
                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.875rem 1.25rem',
                      borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                      transition: 'background var(--transition)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: 38, minWidth: 38, height: 38,
                        background: mass?.status === 'planned' ? 'var(--primary)' : 'var(--gray-100)',
                        color: mass?.status === 'planned' ? 'white' : 'var(--text-muted)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        <span>{format(sunday, 'MMM')}</span>
                        <span style={{ fontSize: '1rem', lineHeight: 1 }}>{format(sunday, 'd')}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {mass?.label ?? 'Sunday Mass'}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                          {format(sunday, 'EEE, MMM d')}
                        </div>
                      </div>
                    </div>
                    {mass ? (
                      mass.status === 'planned'
                        ? <CheckCircle2 size={16} color="var(--success)" />
                        : <AlertCircle size={16} color="var(--warning)" />
                    ) : (
                      <Plus size={16} color="var(--text-muted)" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
