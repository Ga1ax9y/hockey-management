import { useState, useEffect } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '../../../services/api';
import { useAuthStore } from '../../../hooks/useAuthStore';
import './Roles.css'
export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const token = useAuthStore(state => state.token);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles();
      setRoles(res.data);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить роли');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadRoles();
    }
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createRole({
        role_name: newRole.name.trim(),
        description: newRole.description.trim() || null,
      });
      setNewRole({ name: '', description: '' });
      loadRoles();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при создании роли');
    }
  };

  const startEdit = (role) => {
    setEditingId(role.id);
    setEditForm({ name: role.role_name, description: role.description || '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateRole(editingId, {
        role_name: editForm.name.trim(),
        description: editForm.description.trim() || null,
      });
      setEditingId(null);
      loadRoles();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при обновлении роли');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту роль?')) return;
    try {
      await deleteRole(id);
      loadRoles();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при удалении роли');
    }
  };

  if (loading) return <div>Загрузка ролей...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-roles">
      <h2>Управление ролями</h2>

      <form onSubmit={handleCreate} className="admin-form">
        <h3>Добавить новую роль</h3>
        <input
          type="text"
          placeholder="Название роли"
          value={newRole.name}
          onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Описание (опционально)"
          value={newRole.description}
          onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
        />
        <button type="submit">Создать роль</button>
      </form>

      <div className="roles-list">
        <h3>Существующие роли</h3>
        {roles.length === 0 ? (
          <p>Нет ролей</p>
        ) : (
          <ul>
            {roles.map((role) => (
              <li key={role.id} className="role-item">
                {editingId === role.id ? (
                  <form onSubmit={handleUpdate} className="edit-form">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                    <button type="submit">Сохранить</button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Отмена
                    </button>
                  </form>
                ) : (
                <div className="role-display">
                    <div className="role-info">
                        <span className="role-id">ID: {role.id}</span>
                        <strong>{role.role_name}</strong>
                        {role.description && <span> — {role.description}</span>}
                    </div>
                    <div className="role-actions">
                        <button onClick={() => startEdit(role)}>Редактировать</button>
                        <button onClick={() => handleDelete(role.id)} className="btn-danger">
                        Удалить
                        </button>
                    </div>
                </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
