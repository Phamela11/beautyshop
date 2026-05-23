import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home         from './pages/home/Home'
import Login        from './pages/Login'
import Register     from './pages/Register'
import ClientLayout from './pages/client/ClientLayout'
import AdminLayout  from './pages/admin/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={<ClientLayout />} />
        <Route path="/admin"     element={<AdminLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
