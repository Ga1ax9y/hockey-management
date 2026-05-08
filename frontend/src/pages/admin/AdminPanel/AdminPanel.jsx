import { Link } from "react-router-dom";
import "./AdminPanel.css";
import { useRole } from "../../../hooks/useRole";

export default function AdminPanel() {
  const { isAdmin, isManager } = useRole();

  return (
    <div className="admin-page container">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Панель управления</h1>
      </header>

      <div className="admin-page__grid admin-grid">
        {isAdmin && (
          <Link to="/management/roles" className="admin-grid__card admin-card">
            <h2 className="admin-card__title">Роли пользователей</h2>
            <p className="admin-card__description">
              Полное описание ролей пользователей
            </p>
            <span className="admin-card__action">Перейти →</span>
          </Link>
        )}

        {(isAdmin || isManager) && (
          <>
            <Link to="/management/teams" className="admin-grid__card admin-card">
              <h2 className="admin-card__title">Иерархия команд</h2>
              <p className="admin-card__description">
                Создание и управление хоккейными командами, привязка персонала
              </p>
              <span className="admin-card__action">Перейти →</span>
            </Link>
            <Link to="/management/players" className="admin-grid__card admin-card">
              <h2 className="admin-card__title">Игроки</h2>
              <p className="admin-card__description">
                Управление игроками, создание, редактирование и удаление
              </p>
              <span className="admin-card__action">Перейти →</span>
            </Link>
            <Link to="/management/users/create" className="admin-grid__card admin-card">
              <h2 className="admin-card__title">Создать пользователя</h2>
              <p className="admin-card__description">
                Создание учетной записи пользователя
              </p>
              <span className="admin-card__action">Перейти →</span>
            </Link>
            <Link to="/management/users" className="admin-grid__card admin-card">
              <h2 className="admin-card__title">Список пользователей</h2>
              <p className="admin-card__description">
                Просмотр всех зарегистрированных участников вашей организации
              </p>
              <span className="admin-card__action">Перейти →</span>
            </Link>
          </>
        )}
      </div>

      {!isAdmin && !isManager && (
        <div className="admin-page__empty-state">
          <p className="admin-page__empty-text">
            У вас нет доступа к разделам администрирования.
          </p>
        </div>
      )}
    </div>
  );
}
