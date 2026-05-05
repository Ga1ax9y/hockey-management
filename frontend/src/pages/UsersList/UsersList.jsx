import { useEffect, useState } from "react";
import { getAllUsers } from "../../services/api";
import Loader from "../../components/layout/Loader/Loader";
import "./UsersList.css";
import ErrorPage from "../Error/ErrorPage";
import { isoToRuDate } from "../../utils/date";

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await getAllUsers();
                setUsers(res.data.data);
            } catch (err) {
                setError(err.response?.data);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <Loader />;
    if (error) return <ErrorPage error={error} />;

    return (
        <div className="users-page container">
            <header className="users-page__header">
                <div className="users-page__title-group">
                    <h1 className="users-page__title">Состав организации</h1>
                    <span className="users-page__count">{users.length} участников</span>
                </div>
                <button className="users-page__add-btn" onClick={() => window.location.href='/admin/users/create'}>
                    + Добавить
                </button>
            </header>

            {error && <div className="users-page__error">{error}</div>}

            <div className="users-page__table-wrapper">
                <table className="users-table">
                    <thead className="users-table__head">
                        <tr className="users-table__row">
                            <th className="users-table__th">Участник</th>
                            <th className="users-table__th">Email</th>
                            <th className="users-table__th">Роль</th>
                            <th className="users-table__th">Дата регистрации</th>
                        </tr>
                    </thead>
                    <tbody className="users-table__body">
                        {users.map((user) => (
                            <tr key={user.id} className="users-table__row">
                                <td className="users-table__td">
                                    <div className="user-info">
                                        <div className="user-info__avatar">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.fullName} className="user-info__img" />
                                            ) : (
                                                <div className="user-info__placeholder">
                                                    {user.fullName.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="user-info__name">{user.fullName}</span>
                                    </div>
                                </td>
                                <td className="users-table__td">{user.email}</td>
                                <td className="users-table__td">
                                    <span className={`user-role user-role--${user.roleId}`}>
                                        {user.role?.name || `Роль #${user.roleId}`}
                                    </span>
                                </td>
                                <td className="users-table__td">
                                    {isoToRuDate(user.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
