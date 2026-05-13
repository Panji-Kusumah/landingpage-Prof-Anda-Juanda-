/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Publications from './pages/Publications';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import AccessibilityWidget from './components/AccessibilityWidget';

export default function App() {
    return (
        <Router>
            <AccessibilityWidget />
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/publications" element={<Publications />} />
                    <Route path="/gallery" element={<Gallery />} />

                    <Route path="/secure-admin-login" element={<Admin />} />
                    <Route path="/secure-admin-dashboard" element={<AdminDashboard />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </Router>
    );
}
