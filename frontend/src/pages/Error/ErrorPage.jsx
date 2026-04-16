import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';


const ErrorPage = ({ error }) => {
    const navigate = useNavigate();

    const errorData = {
        title: error?.error || "ОШИБКА СИСТЕМЫ",
        message: error?.message || "Не удалось выполнить операцию. Попробуйте обновить страницу или вернуться позже.",
        context: error?.context || null,
        code: error?.httpCode || "500"
    };

    return (
        <div className="error-page container">
            <div className="error-page__card">
                <header className="error-page__header">
                    <div className="error-page__status-code">{errorData.code}</div>
                    <h1 className="error-page__title">{errorData.title}</h1>
                </header>

                <main className="error-page__body">
                    <p className="error-page__message">{errorData.message}</p>

                    {errorData.context && (
                        <div className="error-page__details details-box">
                            <span className="details-box__label">Технические детали:</span>
                            <code className="details-box__content">
                                {errorData.context}
                            </code>
                        </div>
                    )}
                </main>

                <footer className="error-page__actions">
                    <button
                        className="error-page__btn error-page__btn--primary"
                        onClick={() => navigate(-1)}
                    >
                        Вернуться назад
                    </button>
                    <button
                        className="error-page__btn error-page__btn--secondary"
                        onClick={() => navigate('/')}
                    >
                        На главную
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ErrorPage;
