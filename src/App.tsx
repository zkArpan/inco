import React from 'react';
import { Header } from './components/Header';
import { UploadPage } from './components/UploadPage';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <Header />
      <UploadPage />
    </div>
  );
}

export default App;