import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import './App.css';
import '../styles/global.css';
import Header from './components/layout/Header';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/helpers/ProtectedRoute';

const Layout = () => (
  <>
    <Header />
    <main className="content">
      <Outlet />
    </main>
  </>
);

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { path: '/', element: <ProtectedRoute><Home /></ProtectedRoute> },
      { path: '/register', element: <Register /> },
      { path: '/login', element: <Login /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
