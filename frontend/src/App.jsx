import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import './App.css';
import '../styles/global.css';
import Header from './components/layout/Header/Header';
import Home from './pages/Home/Home';
import NotFound from './pages/NotFound/NotFound';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import ProtectedRoute from './components/helpers/ProtectedRoute';
import TeamDetails from './pages/TeamDetails/TeamDetails';
import TeamMembers from './pages/TeamMembers/TeamMembers';
import Profile from './pages/Profile/Profile';
import PlayerProfile from './pages/PlayerProfile/PlayerProfile';
import { useEffect } from 'react';
import { useAuthStore } from './hooks/useAuthStore';
import AdminPanel from './pages/admin/AdminPanel/AdminPanel';
import Roles from './pages/admin/Roles/Roles';
import Users from './pages/manager/Users/Users';
import Hierarchy from './pages/manager/Hierarchy/Hierarchy';
import Players from './pages/manager/Players/Players';
import Events from './pages/coach/Events/Events';
import AddMedicalRecord from './pages/medical/AddMedicalRecord/AddMedicalRecord';
import Schedule from './components/Schedule/Schedule';
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
      { path: '/profile', element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      { path: '/admin', element: (
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        ),
      },
      { path: '/admin/users', element: (
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        ),
      },
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
      { path: '/events', element: (
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        ),
      },
      { path: '/players/:id', element: (
          <ProtectedRoute>
            <PlayerProfile />
          </ProtectedRoute>
        ),
      },
      { path: '/players/:id/medical', element: (
        <ProtectedRoute>
          <AddMedicalRecord />
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
  useEffect(() => {
    useAuthStore.getState().init();
  }, []);
  return <RouterProvider router={router} />;
}
