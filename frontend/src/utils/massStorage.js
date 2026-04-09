const mockLineup = {
  'Entrance': { id: 'm1', title: 'Come, Now Is The Time To Worship', category: 'Entrance', lyrics: "Come, now is the time to worship\nCome, now is the time to give your heart" },
  'Penitential Act': { id: 'm2', title: 'Kyrie (Mass of Creation)', category: 'Penitential Act' },
  'Gloria': { id: 'm3', title: 'Glory to God (Mass of Creation)', category: 'Gloria', lyrics: "Glory to God in the highest\nAnd on earth, peace to people of good will" },
  'Responsorial Psalm': { id: 'm4', title: 'Psalm 118: This is the day', category: 'Responsorial Psalm' },
  'Alleluia': { id: 'm5', title: 'Celtic Alleluia', category: 'Alleluia' },
  'Offertory': { id: 'm6', title: 'Here I Am, Lord', category: 'Offertory', lyrics: "Here I am, Lord, is it I, Lord?\nI have heard you calling in the night" },
  'Sanctus': { id: 'm7', title: 'Holy, Holy, Holy (Mass of Creation)', category: 'Sanctus' },
  'Agnus Dei': { id: 'm8', title: 'Lamb of God (Mass of Creation)', category: 'Agnus Dei' },
  'Communion': { id: 'm9', title: 'Bread of Life', category: 'Communion', lyrics: "I am the Bread of life\nYou who come to me shall not hunger" },
  'Recessional': { id: 'm10', title: 'City of God', category: 'Recessional', lyrics: "Awake from your slumber\nArise from your sleep" },
};

export const DEFAULT_MASSES = {
  '2026-04-12': { label: '2nd Sunday of Easter', status: 'planned', lineup: { ...mockLineup } },
  '2026-04-19': { label: '3rd Sunday of Easter', status: 'planned', lineup: { ...mockLineup, 'Entrance': { id: 'm11', title: 'Jesus Christ Is Risen Today', category: 'Entrance', lyrics: "Jesus Christ is ris'n today, Alleluia!" } } },
  '2026-04-26': { label: '4th Sunday of Easter', status: 'pending', lineup: {} },
  '2026-05-03': { label: '5th Sunday of Easter', status: 'pending', lineup: {} },
  '2026-05-10': { label: '6th Sunday of Easter', status: 'none', lineup: {} },
};

const STORAGE_KEY = 'cmms_masses';

export const getMasses = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse masses from storage', e);
    }
  }
  // Initialize on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MASSES));
  return DEFAULT_MASSES;
};

export const saveMasses = (massesObj) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(massesObj));
};

export const saveMassDetails = (dateStr, massDetails) => {
  const masses = getMasses();
  masses[dateStr] = massDetails;
  saveMasses(masses);
};
