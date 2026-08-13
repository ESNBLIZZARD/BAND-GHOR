/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { BandProfile } from './pages/BandProfile';
import { ImportPlaylist } from './pages/ImportPlaylist';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/bands/:slug" element={<BandProfile />} />
          <Route path="/import" element={<ImportPlaylist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
