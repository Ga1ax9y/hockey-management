import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import './App.css';
import '../styles/global.css';
import Header from './components/layout/Header';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/helpers/ProtectedRoute';
import Roles from './components/admin/Roles';
import Hierarchy from './components/manager/Hierarchy';
import TeamDetails from './pages/TeamDetails';
import TeamMembers from './pages/TeamMembers';
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
      { path: '/', element:
      <ProtectedRoute>
        <Home />
      </ProtectedRoute> },
      { path: '/register', element: <Register /> },
      { path: '/login', element: <Login /> },
      { path: '/admin/roles', element: (
        <ProtectedRoute>
          <Roles />
        </ProtectedRoute>
        ),
      },
      { path: '/manager/hierarchy', element: (
        <ProtectedRoute>
          <Hierarchy />
        </ProtectedRoute>
        ),
      },
      {
      path: '/teams/:id', element: (
        <ProtectedRoute>
          <TeamDetails />
        </ProtectedRoute>
        ),
      },
      {
      path: '/teams/:id/members', element: (
        <ProtectedRoute>
          <TeamMembers />
        </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
