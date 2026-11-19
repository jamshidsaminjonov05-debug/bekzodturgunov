import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './lib/auth'
import Toaster from './components/Toaster'
import Layout from './components/Layout'
import Home from './pages/Home'
import SectionPage from './pages/SectionPage'
import TestRunner from './pages/TestRunner'
import LessonPage from './pages/LessonPage'
import BookUnitPage from './pages/BookUnitPage'
import BookDetailPage from './pages/BookDetailPage'
import GamesPage from './pages/GamesPage'
import LearningHubPage from './pages/LearningHubPage'
import Contest from './pages/Contest'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster />
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="bolim/:slug" element={<SectionPage />} />
            <Route path="test/:id" element={<TestRunner />} />
            <Route path="dars/:id" element={<LessonPage />} />
            <Route path="kitob/:id/:unit" element={<BookUnitPage />} />
            <Route path="kitob-katalog/:id" element={<BookDetailPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="learning" element={<LearningHubPage />} />
            <Route path="musobaqa" element={<Contest />} />
            <Route path="profil" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
