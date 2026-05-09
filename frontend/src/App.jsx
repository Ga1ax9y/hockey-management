import {
	createBrowserRouter,
	Outlet,
	RouterProvider,
	useLocation,
} from "react-router-dom";
import "./App.css";
import "../styles/global.css";
import Header from "./components/layout/Header/Header";
import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound/NotFound";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import ProtectedRoute from "./components/helpers/ProtectedRoute";
import TeamDetails from "./pages/TeamDetails/TeamDetails";
import TeamMembers from "./pages/TeamMembers/TeamMembers";
import Profile from "./pages/Profile/Profile";
import PlayerProfile from "./pages/PlayerProfile/PlayerProfile";
import { useEffect } from "react";
import { useAuthStore } from "./hooks/useAuthStore";
import AdminPanel from "./pages/admin/AdminPanel/AdminPanel";
import Roles from "./pages/admin/Roles/Roles";
import Users from "./pages/manager/Users/Users";
import Hierarchy from "./pages/manager/Hierarchy/Hierarchy";
import Players from "./pages/manager/Players/Players";
import Events from "./pages/coach/Events/Events";
import AddMedicalRecord from "./pages/medical/AddMedicalRecord/AddMedicalRecord";
import Schedule from "./components/Schedule/Schedule";
import AddPhysicalRecord from "./pages/Physicals/AddPhysicalRecord/AddPhysicalRecord";
import MatchStats from "./pages/MatchStats/MatchStats";
import TrainingStats from "./pages/TrainingStats/TrainingStats";
import UsersList from "./pages/UsersList/UsersList";
import PlayerMatches from "./pages/PlayerInfo/Matches/PlayerMatches";
import PlayerTrainings from "./pages/PlayerInfo/Trainings/PlayerTrainings";
import PlayerTransfers from "./pages/PlayerInfo/Transfers/PlayerTransfers";
import Breadcrumbs from "./components/layout/Breadcrumbs/Breadcrumbs";
import Analytics from "./pages/Analytics/Analytics";
const Layout = () => {
	const location = useLocation();
	const hideBreadcrumbsRoutes = ["/login", "/register"];
	const shouldShowBreadcrumbs = !hideBreadcrumbsRoutes.includes(
		location.pathname,
	);

	return (
		<>
			<Header />
			{shouldShowBreadcrumbs && <Breadcrumbs />}
			<main className="content">
				<Outlet />
			</main>
		</>
	);
};

const router = createBrowserRouter([
	{
		element: <Layout />,
		errorElement: <NotFound />,
		children: [
			{
				path: "/",
				element: (
					<ProtectedRoute>
						<Home />
					</ProtectedRoute>
				),
			},
			{ path: "/login", element: <Login /> },
			{ path: "/register", element: <Register /> },
			{
				path: "/profile",
				element: (
					<ProtectedRoute>
						<Profile />
					</ProtectedRoute>
				),
			},
			{
				path: "/profile/:id",
				element: (
					<ProtectedRoute>
						<Profile />
					</ProtectedRoute>
				),
			},
			{
				path: "/management",
				element: (
					<ProtectedRoute>
						<AdminPanel />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/analytics",
				element: (
					<ProtectedRoute>
						<Analytics />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/users/create",
				element: (
					<ProtectedRoute>
						<Users />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/users",
				element: (
					<ProtectedRoute>
						<UsersList />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/roles",
				element: (
					<ProtectedRoute>
						<Roles />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/teams",
				element: (
					<ProtectedRoute>
						<Hierarchy />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/players",
				element: (
					<ProtectedRoute>
						<Players />
					</ProtectedRoute>
				),
			},
			{
				path: "/events",
				element: (
					<ProtectedRoute>
						<Events />
					</ProtectedRoute>
				),
			},
			{
				path: "/matches/:id",
				element: (
					<ProtectedRoute>
						<MatchStats />
					</ProtectedRoute>
				),
			},
			{
				path: "/trainings/:id",
				element: (
					<ProtectedRoute>
						<TrainingStats />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/players/:id",
				element: (
					<ProtectedRoute>
						<PlayerProfile />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/players/:id/matches",
				element: (
					<ProtectedRoute>
						<PlayerMatches />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/players/:id/trainings",
				element: (
					<ProtectedRoute>
						<PlayerTrainings />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/players/:id/transfers",
				element: (
					<ProtectedRoute>
						<PlayerTransfers />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/players/:id/medicals",
				element: (
					<ProtectedRoute>
						<AddMedicalRecord />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/players/:id/physicals",
				element: (
					<ProtectedRoute>
						<AddPhysicalRecord />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/teams/:id",
				element: (
					<ProtectedRoute>
						<TeamDetails />
					</ProtectedRoute>
				),
			},
			{
				path: "/management/teams/:id/members",
				element: (
					<ProtectedRoute>
						<TeamMembers />
					</ProtectedRoute>
				),
			},
			{ path: "*", element: <NotFound /> },
		],
	},
]);

export default function App() {
	useEffect(() => {
		useAuthStore.getState().init();
	}, []);
	return <RouterProvider router={router} />;
}
