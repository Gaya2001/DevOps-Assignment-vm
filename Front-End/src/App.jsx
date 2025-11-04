import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CountryProvider } from './context/CountryContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './Pages/HomePage';
import CountryDetailPage from './Pages/CountryDetailPage';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import ProfilePage from './Pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CountryProvider>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/country/:code" element={<CountryDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </CountryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
