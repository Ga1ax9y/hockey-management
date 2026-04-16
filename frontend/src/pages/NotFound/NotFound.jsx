import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found container">
            <div className="not-found__content">
                <div className="not-found__visual">
                    <span className="not-found__number">4</span>
                    <div className="not-found__puck"></div>
                    <span className="not-found__number">4</span>
                </div>

                <h1 className="not-found__title">Вне игры</h1>
                <p className="not-found__text">
                    Похоже, вы зашли в зону раньше шайбы. Страница, которую вы ищете, не существует или была перемещена.
                </p>

                <div className="not-found__actions">
                    <button
                        className="not-found__btn not-found__btn--primary"
                        onClick={() => navigate('/')}
                    >
                        Вернуться на главную
                    </button>
                    <button
                        className="not-found__btn not-found__btn--outline"
                        onClick={() => navigate(-1)}
                    >
                        Назад
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
