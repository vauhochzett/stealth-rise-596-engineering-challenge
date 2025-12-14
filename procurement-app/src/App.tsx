import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import RequestFormPage from './pages/RequestFormPage'
import RequestListPage from './pages/RequestListPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/requests" replace />} />
          <Route path="/requests" element={<RequestListPage />} />
          <Route path="/requests/new" element={<RequestFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
