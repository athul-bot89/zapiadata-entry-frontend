import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import LoginForm from './components/LoginForm'
import HomePage from './components/HomePage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <LoginForm />
              </main>
              <Footer />
            </div>
          }
        />
        
        {/* Home Page Route - No header/footer as HomePage has its own navigation */}
        <Route path="/home" element={<HomePage />} />
        
        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
