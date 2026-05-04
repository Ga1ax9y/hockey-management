import './Profile.css';
import { useAuthStore } from '../../hooks/useAuthStore';
import Loader from '../../components/layout/Loader/Loader';

export default function Profile() {
    const { user, isLoading } = useAuthStore();

    if (isLoading) return <Loader />;
    if (!user) return null;

    return (
        <div className="profile container">
            <header className="profile__header">
                <h1 className="profile__title">Личное дело пользователя</h1>
            </header>

            <main className="profile__content">
                <div className="profile__card user-card">
                    <div className="user-card__aside">
                        <div className="user-card__avatar-wrapper">
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.fullName}
                                    className="user-card__avatar"
                                />
                            ) : (
                                <div className="user-card__avatar-placeholder">
                                    {user.fullName?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                        <div className="user-card__status-badge">Активен</div>
                    </div>

                    <div className="user-card__main">
                        <div className="user-card__group">
                            <label className="user-card__label">Полное имя</label>
                            <div className="user-card__value user-card__value--accent">
                                {user.fullName || '—'}
                            </div>
                        </div>

                        <div className="user-card__grid">
                            <div className="user-card__group">
                                <label className="user-card__label">Email</label>
                                <div className="user-card__value">{user.email}</div>
                            </div>

                            <div className="user-card__group">
                                <label className="user-card__label">Роль в системе</label>
                                <div className="user-card__value">
                                    <span className="user-card__role-tag">{user.role.name}</span>
                                </div>
                            </div>

                            <div className="user-card__group">
                                <label className="user-card__label">Организация</label>
                                <div className="user-card__value">{user.organization?.name || '—'}</div>
                            </div>

                            <div className="user-card__group">
                                <label className="user-card__label">Дата регистрации</label>
                                <div className="user-card__value">
                                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
