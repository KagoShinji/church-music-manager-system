import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const initialMockSongs = [
  { title: 'Here I Am, Lord', category: 'Entrance', tempo: 'medium', tags: ['Ordinary Time', 'Vocation'], language: 'English', lyrics: 'I, the Lord of sea and sky\nI have heard my people cry\nAll who dwell in dark and sin\nMy hand will save\n\nHere I am, Lord. Is it I, Lord?\nI have heard you calling in the night\nI will go, Lord, if you lead me\nI will hold your people in my heart' },
  { title: 'Lord Have Mercy', category: 'Kyrie', tempo: 'slow', tags: ['All'], language: 'English', lyrics: 'Lord have mercy\nLord have mercy\n\nChrist have mercy\nChrist have mercy\n\nLord have mercy\nLord have mercy' },
  { title: 'Glory to God', category: 'Gloria', tempo: 'fast', tags: ['Joyful', 'Ordinary Time'], language: 'English', lyrics: 'Glory to God in the highest\nAnd on earth, peace to people of good will!\n\nWe praise you, we bless you\nWe adore you, we glorify you\nWe give you thanks for your great glory' },
  { title: 'The Lord is my Shepherd', category: 'Responsorial Psalm', tempo: 'slow', tags: ['Comfort', 'Funeral', 'Ordinary Time'], language: 'English' },
  { title: 'Alleluia', category: 'Gospel Acclamation', tempo: 'fast', tags: ['All'], language: 'English' },
  { title: 'Take and Receive', category: 'Offertory', tempo: 'slow', tags: ['Dedication'], language: 'English' },
  { title: 'One Bread, One Body', category: 'Communion', tempo: 'slow', tags: ['Eucharist'], language: 'English' },
  { title: 'City of God', category: 'Recessional', tempo: 'fast', tags: ['Joyful', 'Sending Forth'], language: 'English' },
  { title: 'O Come, O Come, Emmanuel', category: 'Entrance', tempo: 'slow', tags: ['Advent'], language: 'English' },
  { title: 'Joy to the World', category: 'Recessional', tempo: 'fast', tags: ['Christmas'], language: 'English' },
  { title: 'Hosea', category: 'Entrance', tempo: 'slow', tags: ['Lent', 'Repentance'], language: 'English' },
  { title: 'Jesus Christ Is Risen Today', category: 'Entrance', tempo: 'fast', tags: ['Easter'], language: 'English' },
];

/**
 * Push initial mock songs to Firestore
 */
export const seedDatabase = async () => {
  const songsCol = collection(db, 'songs');
  const snap = await getDocs(songsCol);
  if (!snap.empty) {
    console.log("Database already seeded");
    return;
  }
  for (const song of initialMockSongs) {
    await addDoc(songsCol, song);
  }
  console.log("Database successfully seeded with Initial Mock Songs");
};

/**
 * Determine the liturgical season given a date.
 */
export const getSeason = (date) => {
  const month = date.getMonth();
  if (month === 11) return 'Advent';
  if (month === 0) return 'Christmas';
  if (month === 2 || month === 3) return 'Lent';
  if (month === 4) return 'Easter';
  return 'Ordinary Time';
};

/**
 * Fetch all songs from formatting the docs
 */
export const fetchAllSongs = async () => {
  const snapshot = await getDocs(collection(db, 'songs'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Filter songs by season, allowing 'All' tagged songs as well.
 */
export const getSongsBySeason = (songs, season) => {
  return songs.filter(song => 
    (song.tags && song.tags.includes(season)) || 
    (song.tags && song.tags.includes('All')) || 
    (season === 'Ordinary Time' && (!song.tags || !song.tags.some(t => ['Advent', 'Lent', 'Christmas', 'Easter'].includes(t))))
  );
};

export const avoidRecentSongs = (availableSongs) => {
  return availableSongs; // Returns all for now.
};

/**
 * Automatically picks a lineup of songs for a Mass asynchronously from Firestore.
 */
export const generateMassSongs = async (date, includeGloria = true) => {
  const season = getSeason(date);
  
  const allSongs = await fetchAllSongs();
  let pool = getSongsBySeason(allSongs, season);
  pool = avoidRecentSongs(pool);

  const categories = [
    'Entrance',
    'Kyrie',
    ...(includeGloria && season !== 'Lent' && season !== 'Advent' ? ['Gloria'] : []),
    'Responsorial Psalm',
    'Gospel Acclamation',
    'Offertory',
    'Communion',
    'Recessional'
  ];

  const lineup = {};

  categories.forEach(cat => {
    const options = pool.filter(s => s.category === cat);
    if (options.length > 0) {
      lineup[cat] = options[Math.floor(Math.random() * options.length)];
    } else {
      lineup[cat] = null;
    }
  });

  return {
    date,
    season,
    lineup
  };
};
