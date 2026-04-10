import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Plus, CheckCircle2, AlertCircle, Save, FileText } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSunday, isToday, parseISO } from 'date-fns';
import SongSelectorModal from '../components/SongSelectorModal';
import PresentationViewer from '../components/PresentationViewer';
import { fetchAllSongs } from '../utils/aiLogic';

const CATEGORY_ORDER = [
  'Entrance', 'Penitential Act', 'Gloria', 'Responsorial Psalm',
  'Alleluia', 'Offertory', 'Sanctus', 'Agnus Dei', 'Communion', 'Recessional'
];

import { getMasses, saveMasses } from '../utils/massStorage';

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [massesData, setMassesData] = useState(() => getMasses());
  const [selectedDate, setSelectedDate] = useState(null);

  const [allSongs, setAllSongs] = useState([]);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [activeSwapCategory, setActiveSwapCategory] = useState(null);

  const [isPresenting, setIsPresenting] = useState(false);
  const [presentationSongs, setPresentationSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  useEffect(() => {
    fetchAllSongs().then(data => setAllSongs(data)).catch(console.error);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart); // 0 = Sunday

  const today0 = new Date();
  today0.setHours(0, 0, 0, 0);

  // Compute upcoming events globally from massesData + current month sundays
  const upcomingEventsMap = new Map();
  // 1. Add all planned/pending masses from massesData that are >= today
  Object.entries(massesData).forEach(([dStr, m]) => {
    const dObj = parseISO(dStr);
    if (dObj >= today0 && m.status !== 'none') {
      upcomingEventsMap.set(dStr, { date: dObj, key: dStr, mass: m });
    }
  });
  // 2. Add current month sundays if not already present
  days.filter(d => isSunday(d) && d >= today0).forEach(d => {
    const dStr = format(d, 'yyyy-MM-dd');
    if (!upcomingEventsMap.has(dStr)) {
      upcomingEventsMap.set(dStr, { date: d, key: dStr, mass: massesData[dStr] });
    }
  });
  const upcomingEvents = Array.from(upcomingEventsMap.values())
    .sort((a, b) => a.date - b.date)
    .slice(0, 6);

  const handleDayClick = (key) => {
    let updatedMasses = { ...massesData };

    if (selectedDate && selectedDate !== key && updatedMasses[selectedDate]?.status === 'none') {
      delete updatedMasses[selectedDate];
    }

    if (!updatedMasses[key]) {
       updatedMasses[key] = { label: isSunday(parseISO(key)) ? 'Sunday Mass' : 'Special Mass', status: 'none', lineup: {} };
    }
    
    setMassesData(updatedMasses);
    saveMasses(updatedMasses);
    setSelectedDate(key);
  };

  const openSwapModal = (category) => {
    setActiveSwapCategory(category);
    setIsSwapModalOpen(true);
  };

  const handleSwapSong = (song) => {
    if (!activeSwapCategory || !selectedDate) return;
    const newMassesData = {
      ...massesData,
      [selectedDate]: {
        ...massesData[selectedDate],
        status: massesData[selectedDate].status === 'none' ? 'pending' : massesData[selectedDate].status,
        lineup: {
          ...massesData[selectedDate].lineup,
          [activeSwapCategory]: song
        }
      }
    };
    setMassesData(newMassesData);
    saveMasses(newMassesData);
    setIsSwapModalOpen(false);
    setActiveSwapCategory(null);
  };

  const startPresentation = (categoryKey) => {
    const mass = massesData[selectedDate];
    if (!mass || !mass.lineup) return;
    
    // Filter out valid song objects with lyrics
    const songsWithLyrics = Object.values(mass.lineup).filter(s => s && typeof s === 'object' && s.lyrics != null);
    if (songsWithLyrics.length === 0) {
      alert("None of the scheduled songs have lyrics attached yet.");
      return;
    }
    setPresentationSongs(songsWithLyrics);
    
    const targetSong = mass.lineup[categoryKey];
    let actualStartIndex = 0;
    if (targetSong) {
       const foundIndex = songsWithLyrics.findIndex(s => s.id === targetSong.id);
       if(foundIndex !== -1) actualStartIndex = foundIndex;
    }
    
    setCurrentSongIndex(actualStartIndex);
    setIsPresenting(true);
  };

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
              const mass = massesData[key];
              const isSun = isSunday(day);
              const isCurrentDay = isToday(day);
              const colPos = (startPad + idx) % 7;
              const isLastCol = colPos === 6;
              const isSelected = selectedDate === key;

              return (
                <div
                  key={key}
                  onClick={() => handleDayClick(key)}
                  style={{
                    minHeight: 80,
                    padding: '0.5rem',
                    borderRight: isLastCol ? 'none' : '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    background: isSelected ? 'var(--primary-subtle)' : isCurrentDay ? 'var(--blue-50)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background var(--transition)',
                    position: 'relative',
                    boxShadow: isSelected ? 'inset 0 0 0 2px var(--primary)' : 'none'
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--primary-subtle)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isCurrentDay ? 'var(--blue-50)' : 'transparent'; }}
                >
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: isCurrentDay ? 800 : isSun || mass ? 600 : 400,
                    color: isCurrentDay ? 'var(--white)' : isSun || (mass && mass.status !== 'none') ? 'var(--primary)' : 'var(--text-sub)',
                    width: 24, height: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCurrentDay ? 'var(--primary)' : 'transparent',
                    borderRadius: isCurrentDay ? '50%' : '0'
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
                      borderRadius: '4px'
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
                  <div style={{ width: 12, height: 12, background: item.bg, flexShrink: 0, borderRadius: '2px' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events List */}
          <div className="card stagger-3" style={{ padding: 0 }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Upcoming Events</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {upcomingEvents.map((evt, i) => {
                const { key, date, mass } = evt;
                const isSelected = selectedDate === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleDayClick(key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.875rem 1.25rem',
                      borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                      transition: 'background var(--transition)',
                      background: isSelected ? 'var(--primary-subtle)' : 'transparent'
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--gray-50)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: 38, minWidth: 38, height: 38,
                        background: mass?.status === 'planned' ? 'var(--primary)' : 'var(--gray-100)',
                        color: mass?.status === 'planned' ? 'white' : 'var(--text-muted)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderRadius: '6px'
                      }}>
                        <span>{format(date, 'MMM')}</span>
                        <span style={{ fontSize: '1rem', lineHeight: 1 }}>{format(date, 'd')}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {mass?.label ?? (isSunday(date) ? 'Sunday Mass' : 'Special Mass')}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                          {format(date, 'EEE, MMM d')}
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

      {/* Selected Lineup Editor */}
      {selectedDate && massesData[selectedDate] && (
        <div className="card stagger-4" style={{ marginTop: '1.5rem', padding: '1.5rem', borderColor: 'var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Mass Lineup Editing
              </h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                <input
                  style={{
                    fontWeight: 600, color: 'var(--primary)',
                    background: 'transparent', border: 'none', borderBottom: '1px dashed var(--primary)',
                    outline: 'none', padding: '0 0.1rem',
                  }}
                  value={massesData[selectedDate].label}
                  onChange={(e) => {
                    const newMassesData = {
                      ...massesData,
                      [selectedDate]: { ...massesData[selectedDate], label: e.target.value }
                    };
                    setMassesData(newMassesData);
                    saveMasses(newMassesData);
                  }}
                />
                <span style={{ margin: '0 0.5rem' }}>•</span>
                {format(parseISO(selectedDate), 'EEEE, MMMM do, yyyy')}
              </div>
            </div>
            <div className="flex gap-2">
               <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger-subtle)' }} onClick={() => {
                 if (window.confirm("Are you sure you want to delete this mass?")) {
                   const newMassesData = { ...massesData };
                   delete newMassesData[selectedDate];
                   setMassesData(newMassesData);
                   saveMasses(newMassesData);
                   setSelectedDate(null);
                 }
               }}>
                 Delete
               </button>
               <button className="btn btn-secondary" onClick={() => {
                 let updatedMasses = { ...massesData };
                 if (updatedMasses[selectedDate]?.status === 'none') {
                   delete updatedMasses[selectedDate];
                   setMassesData(updatedMasses);
                   saveMasses(updatedMasses);
                 }
                 setSelectedDate(null);
               }}>
                 Close
               </button>
               <button className="btn btn-primary" onClick={() => {
                 const newMassesData = {
                   ...massesData,
                   [selectedDate]: {
                     ...massesData[selectedDate],
                     status: 'planned'
                   }
                 };
                 setMassesData(newMassesData);
                 saveMasses(newMassesData);
                 alert('Lineup saved successfully!');
               }}>
                 <Save size={16}/>
                 Save Lineup
               </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
            {CATEGORY_ORDER.map(cat => {
              const currentSongObj = massesData[selectedDate].lineup?.[cat];
              const hasSong = !!currentSongObj;
              const isObject = currentSongObj !== null && typeof currentSongObj === 'object';
              const displayTitle = isObject ? currentSongObj.title : currentSongObj || '';

              return (
                <div key={cat} style={{ 
                  display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', 
                  background: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--border)' 
                }}>
                  <div style={{ width: '200px', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {cat}
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {hasSong ? (
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{displayTitle}</div>
                    ) : (
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No song chosen</div>
                    )}
                    
                    <div className="flex gap-2">
                      {isObject && currentSongObj.lyrics && (
                        <button className="btn btn-icon btn-secondary" onClick={() => startPresentation(cat)} title="View Lyrics">
                          <FileText size={15}/>
                        </button>
                      )}
                      <button className="btn btn-sm btn-secondary" onClick={() => openSwapModal(cat)}>
                        {hasSong ? 'Swap' : 'Choose Song'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {isSwapModalOpen && (
        <SongSelectorModal
          category={activeSwapCategory}
          allSongs={allSongs}
          onSelect={handleSwapSong}
          onClose={() => setIsSwapModalOpen(false)}
        />
      )}

      {isPresenting && (
        <PresentationViewer 
          songs={presentationSongs} 
          initialSongIndex={currentSongIndex} 
          onClose={() => setIsPresenting(false)} 
        />
      )}
    </div>
  );
};

export default CalendarPage;
