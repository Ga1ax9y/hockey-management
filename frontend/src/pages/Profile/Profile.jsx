import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';
import { useAuthStore } from '../../hooks/useAuthStore';
import { getUserById } from '../../services/api';
import Loader from '../../components/layout/Loader/Loader';
import { isoToRuDate } from '../../utils/date';

export default function Profile() {
    const { id } = useParams();
    const { user: authUser, isLoading: authLoading } = useAuthStore();

    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!id) {
                setProfileUser(authUser);
                return;
            }

            if (authUser && id === authUser.id) {
                setProfileUser(authUser);
                return;
            }

            try {
                setLoading(true);
                const response = await getUserById(id);
                setProfileUser(response.data);
            } catch (err) {
                setError('Пользователь не найден');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id, authUser]);

    if (authLoading || loading) return <Loader />;
    if (error) return <div className="profile container"><h1>{error}</h1></div>;
    if (!profileUser) return null;

    const isOwnProfile = !id || (authUser && id === authUser.id);

    return (
        <div className="profile container">
            <header className="profile__header">
                <h1 className="profile__title">
                    {isOwnProfile ? 'Личное дело' : `Профиль пользователя`}
                </h1>
            </header>

            <main className="profile__content">
                <div className="profile__card user-card">
                    <div className="user-card__aside">
                        <div className="user-card__avatar-wrapper">
                            {profileUser.avatarUrl ? (
                                <img
                                    src={profileUser.avatarUrl}
                                    alt={profileUser.fullName}
                                    className="user-card__avatar"
                                />
                            ) : (
                                <div className="user-card__avatar-placeholder">
                                    {profileUser.fullName?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                        <div className="user-card__status-badge">Активен</div>
                    </div>

                    <div className="user-card__main">
                        <div className="user-card__group">
                            <label className="user-card__label">Полное имя</label>
                            <div className="user-card__value user-card__value--accent">
                                {profileUser.fullName || '—'}
                            </div>
                        </div>

                        <div className="user-card__grid">
                            <div className="user-card__group">
                                <label className="user-card__label">Email</label>
                                <div className="user-card__value">{profileUser.email}</div>
                            </div>

                            <div className="user-card__group">
                                <label className="user-card__label">Роль в системе</label>
                                <div className="user-card__value">
                                    <span className="user-card__role-tag">
                                        {profileUser.role?.name || profileUser.role}
                                    </span>
                                </div>
                            </div>

                            <div className="user-card__group">
                                <label className="user-card__label">Организация</label>
                                <div className="user-card__value">
                                    {profileUser.organization?.name || '—'}
                                </div>
                            </div>

                            <div className="user-card__group">
                                <label className="user-card__label">Дата регистрации</label>
                                <div className="user-card__value">
                                    {isoToRuDate(profileUser.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
