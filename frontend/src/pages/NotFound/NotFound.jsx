import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__container">
        <h1 className="not-found__title">404</h1>
        <p className="not-found__text">Page not found</p>
        <p className="not-found__description">
          Страница, которую вы ищите, не существует
        </p>
        <Link to="/" className="not-found__link button">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
