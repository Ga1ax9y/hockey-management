import React, { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  getSchedule,
  getTeamById,
  createTraining,
  createMatch,
  updateMatch,
  deleteMatch,
  updateTraining,
  deleteTraining,
} from "../../services/api";
import { inputDateTimeToISO, formatToInputDateTime } from "../../utils/date";
import "./Schedule.css";

const TRAINING_TYPES = [
  { value: "ice", label: "Лед" },
  { value: "gym", label: "Тренажерный зал" },
  { value: "theory", label: "Теория" },
  { value: "recovery", label: "Восстановление" },
  { value: "game", label: "Игровая" },
];
const MATCH_TYPES = [
  { value: "league", label: "Лига" },
  { value: "playoff", label: "Плей-офф" },
  { value: "offseason", label: "Подготовительный" },
];
const Schedule = ({ teamId }) => {
  const calendarRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [TrainingFormData, setTrainingFormData] = useState({
    startTime: "",
    endTime: "",
    location: "",
    trainingType: "ice",
    coachId: "",
    opponent: "",
  });
  const [MatchFormData, setMatchFormData] = useState({
    matchDate: "",
    location: "",
    opponentName: "",
    isHomeGame: true,
    matchType: "league",
    season: "",
  });

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const loadCoaches = useCallback(async () => {
    try {
      const res = await getTeamById(teamId, { includeUsers: true });
      const teamData = res.data?.data || res.data || {};
      const teamUsers =
        teamData.users?.map((ut) => ut.user).filter(Boolean) || [];
      setCoaches(teamUsers.filter((u) => u.role?.code === "COACH"));
    } catch (err) {
      console.error("Ошибка загрузки тренеров:", err);
    }
  }, [teamId]);

  const handleContextMenu = (e, date, eventData = null) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      date: date,
      event: eventData,
    });
  };

  const openCreateModal = (type) => {
    setModalType(type);
    const dateStr = new Intl.DateTimeFormat("sv-SE").format(contextMenu.date);
    setTrainingFormData({
      startTime: `${dateStr}T10:00`,
      endTime: `${dateStr}T11:30`,
      location: "",
      trainingType: "ice",
      coachId: "",
    });
    setMatchFormData({
      matchDate: `${dateStr}T19:00`,
      location: "",
      opponentName: "",
      isHomeGame: true,
      matchType: "league",
      season: "2025/2026",
    });

    loadCoaches();
    setShowModal(true);
    setContextMenu(null);
  };

  const openEditModal = (event) => {
    const type = event.extendedProps.type;
    setModalType(type);
    setEditingId(event.id);

    if (type === "TRAINING") {
      console.log(event);
      setTrainingFormData({
        startTime: formatToInputDateTime(event.start),
        endTime: formatToInputDateTime(event.end),
        location: event.extendedProps.location || "",
        trainingType: event.extendedProps.trainingType || "ice",
        coachId: event.extendedProps.coachId || "",
      });
    } else {
      setMatchFormData({
        matchDate: formatToInputDateTime(event.start),
        location: event.extendedProps.location || "",
        opponentName: event.extendedProps.opponentName || "",
        isHomeGame: event.extendedProps.isHomeGame,
        matchType: event.extendedProps.matchType || "league",
        season: event.extendedProps.season || "2025/2026",
      });
    }
    loadCoaches();
    setShowModal(true);
    setContextMenu(null);
  };

  const handleDelete = async (event) => {
    if (!window.confirm("Удалить это событие?")) return;
    try {
      console.log(event.id);
      if (event.extendedProps.type === "MATCH") {
        await deleteMatch(event.id);
      } else {
        await deleteTraining(event.id);
      }
      calendarRef.current.getApi().refetchEvents();
      setContextMenu(null);
    } catch (err) {
      alert("Ошибка при удалении", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "TRAINING") {
        const submitData = {
          startTime: inputDateTimeToISO(TrainingFormData.startTime),
          endTime: inputDateTimeToISO(TrainingFormData.endTime),
          location: TrainingFormData.location,
          trainingType: TrainingFormData.trainingType,
          teamId: Number(teamId),
          coachId: TrainingFormData.coachId
            ? Number(TrainingFormData.coachId)
            : null,
        };
        editingId
          ? await updateTraining(editingId, submitData)
          : await createTraining(submitData);
      }
      if (modalType === "MATCH") {
        const submitData = {
          matchDate: inputDateTimeToISO(MatchFormData.matchDate),
          location: MatchFormData.location,
          opponentName: MatchFormData.opponentName,
          matchType: MatchFormData.matchType,
          season: MatchFormData.season,
          isHomeGame: MatchFormData.isHomeGame,
          myTeamId: Number(teamId),
        };
        editingId
          ? await updateMatch(editingId, submitData)
          : await createMatch(submitData);
      }

      setShowModal(false);
      setEditingId(null);
      calendarRef.current.getApi().refetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка при сохранении");
    }
  };
  const fetchEvents = async (info, successCallback, failureCallback) => {
    try {
      const response = await getSchedule(teamId, {
        startDate: info.startStr,
        endDate: info.endStr,
      });

      const formattedEvents = response.data.data.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.endDate || event.end,
        opponentName: event.opponentName,
        extendedProps: {
          type: event.type,
          location: event.extendedProps.location,
          coachId: event.extendedProps.coachId,
          isHomeGame: event.extendedProps.isHomeGame,
          ...event.details,
        },
      }));
      successCallback(formattedEvents);
    } catch (error) {
      console.error("Error loading schedule:", error);
      failureCallback(error);
    }
  };

  const renderEventContent = (eventInfo) => {
    const type = eventInfo.event.extendedProps.type;
    const title = eventInfo.event.title;
    const time = eventInfo.timeText;

    return (
      <div className={`calendar-event-wrapper ${type?.toLowerCase()}`}>
        <span className="event-icon">{type === "MATCH" ? "🏒" : "🏋️"}</span>
        <div className="event-info">
          {time && <span className="event-time">{time}</span>}
          <span className="event-title">{title}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="schedule-container">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ru"
        firstDay={1}
        events={fetchEvents}
        eventContent={renderEventContent}
        dayCellDidMount={(arg) => {
          arg.el.addEventListener("contextmenu", (e) =>
            handleContextMenu(e, arg.date, null),
          );
        }}
        eventDidMount={(arg) => {
          arg.el.addEventListener("contextmenu", (e) =>
            handleContextMenu(e, arg.event.start, arg.event),
          );
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        height="auto"
      />

      {contextMenu && (
        <div
          className="custom-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="menu-item disabled">
            {contextMenu.event
              ? contextMenu.event.title
              : contextMenu.date.toLocaleDateString("ru-RU")}
          </div>
          <div className="menu-separator" />

          {contextMenu.event ? (
            <>
              <div
                className="menu-item"
                onClick={() => openEditModal(contextMenu.event)}
              >
                📝 Редактировать
              </div>
              <div
                className="menu-item delete"
                onClick={() => handleDelete(contextMenu.event)}
              >
                🗑️ Удалить
              </div>
            </>
          ) : (
            <div className="menu-item has-submenu">
              Создать...
              <div className="submenu">
                <div
                  className="menu-item"
                  onClick={() => openCreateModal("MATCH")}
                >
                  Матч
                </div>
                <div
                  className="menu-item"
                  onClick={() => openCreateModal("TRAINING")}
                >
                  Тренировка
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Новая {modalType === "MATCH" ? "игра" : "тренировка"}</h3>

            <form className="create-event-form" onSubmit={handleSubmit}>
              {modalType === "TRAINING" ? (
                <>
                  <div className="training-form-row">
                    <div className="form-group">
                      <label>Начало</label>
                      <input
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        type="datetime-local"
                        value={TrainingFormData.startTime}
                        onChange={(e) =>
                          setTrainingFormData({
                            ...TrainingFormData,
                            startTime: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Окончание</label>
                      <input
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        type="datetime-local"
                        value={TrainingFormData.endTime}
                        onChange={(e) =>
                          setTrainingFormData({
                            ...TrainingFormData,
                            endTime: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <label>Место проведения</label>
                  <input
                    type="text"
                    placeholder="Арена / Зал"
                    value={TrainingFormData.location}
                    onChange={(e) =>
                      setTrainingFormData({
                        ...TrainingFormData,
                        location: e.target.value,
                      })
                    }
                    required
                  />
                  <div className="training-form-row">
                    <div className="form-group">
                      <label>Тип тренировки</label>
                      <select
                        value={TrainingFormData.trainingType}
                        onChange={(e) =>
                          setTrainingFormData({
                            ...TrainingFormData,
                            trainingType: e.target.value,
                          })
                        }
                        required
                      >
                        {TRAINING_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Тренер</label>
                      <select
                        value={TrainingFormData.coachId}
                        onChange={(e) =>
                          setTrainingFormData({
                            ...TrainingFormData,
                            coachId: e.target.value,
                          })
                        }
                      >
                        <option value="">Выберите тренера</option>
                        {coaches.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullName || c.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="training-form-row">
                    <div className="form-group">
                      <label>Начало</label>
                      <input
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        type="datetime-local"
                        value={MatchFormData.matchDate}
                        onChange={(e) =>
                          setMatchFormData({
                            ...MatchFormData,
                            matchDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <label>Место проведения</label>
                  <input
                    type="text"
                    placeholder="Арена / Зал"
                    value={MatchFormData.location}
                    onChange={(e) =>
                      setMatchFormData({
                        ...MatchFormData,
                        location: e.target.value,
                      })
                    }
                    required
                  />
                  <label>Имя противника</label>
                  <input
                    type="text"
                    placeholder="Имя противника"
                    value={MatchFormData.opponentName}
                    onChange={(e) =>
                      setMatchFormData({
                        ...MatchFormData,
                        opponentName: e.target.value,
                      })
                    }
                    required
                  />
                  <label>Домашняя игра</label>
                  <select
                    value={MatchFormData.isHomeGame}
                    onChange={(e) =>
                      setMatchFormData({
                        ...MatchFormData,
                        isHomeGame: e.target.value === "true",
                      })
                    }
                    required
                  >
                    <option key="true" value="true">
                      Да
                    </option>
                    <option key="false" value="false">
                      Нет
                    </option>
                  </select>
                  <label>Сезон</label>
                  <input
                    type="text"
                    placeholder="2025/2026"
                    value={MatchFormData.season}
                    onChange={(e) =>
                      setMatchFormData({
                        ...MatchFormData,
                        season: e.target.value,
                      })
                    }
                    required
                  />
                  <div className="training-form-row">
                    <div className="form-group">
                      <label>Тип матча</label>
                      <select
                        value={MatchFormData.matchType}
                        onChange={(e) =>
                          setMatchFormData({
                            ...MatchFormData,
                            matchType: e.target.value,
                          })
                        }
                        required
                      >
                        {MATCH_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn-primary">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
