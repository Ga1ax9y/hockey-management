import { useAuthStore } from '../../../hooks/useAuthStore';
import { Link } from 'react-router-dom';
import './AdminPanel.css';

export default function AdminPanel() {
  const role = useAuthStore(state => state.role);
  const isAdmin = role === 1;
  const isManager = role === 7;

  return (
    <div className="admin-panel">
      <h1 className="admin-panel__title">Панель управления</h1>

      <div className="admin-panel__grid">
        {isAdmin && (
          <Link to="/admin/roles" className="admin-panel__card">
            <h2>Роли пользователей</h2>
            <p>Управление ролями, создание, редактирование и удаление</p>
          </Link>
        )}

        {(isAdmin || isManager) && (
          <>
            <Link to="/manager/hierarchy" className="admin-panel__card">
                <h2>Иерархия команд</h2>
                <p>Создание и управление хоккейными командами, привязка персонала</p>
            </Link>
            <Link to="/manager/players" className="admin-panel__card">
                <h2>Игроки</h2>
                <p>Управление игроками, создание, редактирование и удаление</p>
            </Link>
          </>
        )}

        {/* Сюда позже другие разделы */}
        {/*
        {isAdmin && (
          <Link to="/admin/users" className="admin-panel__card">
            <h2>Пользователи</h2>
            <p>Управление учётными записями</p>
          </Link>
        )}
        */}
      </div>

      {(!isAdmin && !isManager) && (
        <p className="admin-panel__empty">
          У вас нет доступа к разделам администрирования.
        </p>
      )}
    </div>
  );
}
