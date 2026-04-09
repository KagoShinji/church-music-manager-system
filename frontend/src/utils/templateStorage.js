export const DEFAULT_TEMPLATES = [
  {
    id: 1,
    name: 'Sunday Regular Mass',
    desc: 'Standard 8-song structure for Ordinary Time. Covers all liturgical moments.',
    songs: 8,
    categories: ['Entrance', 'Kyrie', 'Gloria', 'Responsorial Psalm', 'Gospel Acclamation', 'Offertory', 'Communion', 'Recessional'],
    color: 'var(--primary)',
    bg: 'var(--primary-subtle)',
    badge: 'badge-blue',
    badgeLabel: 'Ordinary Time',
  },
  {
    id: 2,
    name: 'Funeral Mass',
    desc: 'Solemn 5-song structure focusing on comfort, hope, and resurrection themes.',
    songs: 5,
    categories: ['Entrance', 'Responsorial Psalm', 'Gospel Acclamation', 'Offertory', 'Communion'],
    color: '#16a34a',
    bg: '#f0fdf4',
    badge: 'badge-success',
    badgeLabel: 'Solemn',
  },
  {
    id: 3,
    name: 'Christmas Midnight Mass',
    desc: 'Festive 10-song structure celebrating the birth of Christ.',
    songs: 10,
    categories: ['Entrance', 'Kyrie', 'Gloria', 'Responsorial Psalm', 'Gospel Acclamation', 'Offertory', 'Sanctus', 'Agnus Dei', 'Communion', 'Recessional'],
    color: '#d97706',
    bg: '#fef3c7',
    badge: 'badge-warning',
    badgeLabel: 'Christmas',
  },
  {
    id: 4,
    name: 'Easter Vigil',
    desc: 'Extended 12-song structure for the longest and most sacred liturgy of the year.',
    songs: 12,
    categories: ['Light of Christ', 'Exsultet', 'Psalm 1', 'Psalm 2', 'Psalm 3', 'Gloria', 'Alleluia', 'Offertory', 'Sanctus', 'Agnus Dei', 'Communion', 'Recessional'],
    color: 'var(--blue-600)',
    bg: 'var(--blue-50)',
    badge: 'badge-blue',
    badgeLabel: 'Easter',
  },
];

const STORAGE_KEY = 'cmms_templates';

export const getTemplates = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse templates from storage', e);
    }
  }
  // Initialize on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
  return DEFAULT_TEMPLATES;
};

export const saveTemplate = (template) => {
  const templates = getTemplates();
  const newId = templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1;
  const newTemplate = { ...template, id: newId };
  const updated = [...templates, newTemplate];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newTemplate;
};

export const deleteTemplate = (id) => {
  const templates = getTemplates();
  const updated = templates.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
