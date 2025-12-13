import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import './App.css';
import '../styles/global.css';
import Header from './components/layout/Header/Header';
import Home from './pages/Home/Home';
import NotFound from './pages/NotFound/NotFound';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import ProtectedRoute from './components/helpers/ProtectedRoute';
import Roles from './components/admin/Roles/Roles';
import Hierarchy from './components/manager/Hierarchy/Hierarchy';
import TeamDetails from './pages/TeamDetails/TeamDetails';
import TeamMembers from './pages/TeamMembers/TeamMembers';
import AdminPanel from './components/admin/AdminPanel/AdminPanel';
import Players from './components/manager/Players/Players';
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
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      {
        path: '/admin', element: (
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        ),
      },
      { path: '/admin', element: <AdminPanel /> },
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
      { path: '/manager/players', element: (
        <ProtectedRoute>
          <Players />
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
