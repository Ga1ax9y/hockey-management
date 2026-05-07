import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap = {
    "profile": "Профиль",
    "events": "События",
    "teams": "Команды",
    "hierarchy": "Иерархия",
    "roles": "Роли",
    "players": "Игроки",
    "users": "Пользователи",
    "create": "Создать",
    "matches": "Матчи",
    "trainings": "Тренировки",
    "physicals": "Физические показатели",
    "medicals": "Медицинские данные",
    "admin": "Панель администратора",
    "members": "Участники",
    "transfers": "Трансферы",
    "login": "Вход",
    "register": "Регистрация",
  };

  return (
    <nav className="breadcrumbs container">
      <ul className="breadcrumbs__list">
        <li className="breadcrumbs__item">
          <Link to="/" className="breadcrumbs__link">Главная</Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          const name = breadcrumbNameMap[value] || value;

          return (
            <li key={to} className="breadcrumbs__item">
              <span className="breadcrumbs__separator">/</span>
              {last ? (
                <span className="breadcrumbs__current">{name}</span>
              ) : (
                <Link to={to} className="breadcrumbs__link">{name}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
