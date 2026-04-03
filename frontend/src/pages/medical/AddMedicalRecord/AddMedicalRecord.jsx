import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addMedicalRecord } from '../../../services/api';
import './AddMedicalRecord.css';

export default function AddMedicalRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    injuryDate: '',
    recoveryDate: '',
    diagnosis: '',
    status: 'Лечение',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMedicalRecord(id, formData);
      navigate(`/players/${id}`);
    } catch (err) {
      alert('Ошибка при сохранении: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="medical-form">
      <h1>Новое медицинское заключение</h1>
      <form onSubmit={handleSubmit}>
        <div className="medical-form-group">
          <label>Дата травмы</label>
          <input
            type="date"
            value={formData.injury_date}
            onChange={(e) => setFormData({ ...formData, injuryDate: e.target.value })}
            required
          />
        </div>

        <div className="medical-form-group">
          <label>Приблизительная дата восстановления</label>
          <input
            type="date"
            value={formData.recovery_date}
            onChange={(e) => setFormData({ ...formData, recoveryDate: e.target.value })}
          />
        </div>

        <div className="medical-form-group">
          <label>Диагноз</label>
          <textarea
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            required
          />
        </div>

        <div className="medical-form-group">
          <label>Статус</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          >
            <option value="Лечение">Лечение</option>
            <option value="Реабилитация">Реабилитация</option>
            <option value="Выздоровел">Выздоровел</option>
            <option value="Хроническое">Хроническое</option>
          </select>
        </div>
        <div className='medical-actions'>
            <button type="submit" className="medical-btn btn-primary">Сохранить</button>
            <button type="button" onClick={() => navigate(-1)} className="medical-btn btn-secondary">
            Отмена
            </button>
        </div>
      </form>
    </div>
  );
}
