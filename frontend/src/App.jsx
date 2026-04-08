import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MassPlanner from './pages/MassPlanner';
import SongLibrary from './pages/SongLibrary';
import Templates from './pages/Templates';
import CalendarPage from './pages/CalendarPage';
import FileManager from './pages/FileManager';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="planner" element={<MassPlanner />} />
          <Route path="library" element={<SongLibrary />} />
          <Route path="templates" element={<Templates />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="files" element={<FileManager />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
