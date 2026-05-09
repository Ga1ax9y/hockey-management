import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Profile.css";
import { useAuthStore } from "../../hooks/useAuthStore";
import { getUserById, updateUser } from "../../services/api";
import Loader from "../../components/layout/Loader/Loader";
import { isoToRuDate } from "../../utils/date";
import { useForm } from "react-hook-form";
import ErrorPage from "../Error/ErrorPage";

export default function Profile() {
	const { id } = useParams();
	const { user: authUser, isLoading: authLoading } = useAuthStore();

	const [profileUser, setProfileUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [error, setError] = useState(null);
	const [serverError, setServerError] = useState(null);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			fullName: "",
			oldPassword: "",
			password: "",
		},
	});

	useEffect(() => {
		const fetchUserData = async () => {
			setServerError(null);
			const targetId = id || authUser?.id;
			if (!targetId) return;

			try {
				setLoading(true);
				const response = await getUserById(targetId);
				const userData = response.data;
				setProfileUser(userData);
				reset({ fullName: userData.fullName || "" });
			} catch (err) {
				setError(err.response?.data);
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [id, authUser, reset]);

	const onSubmit = async (data) => {
		try {
			const payload = { fullName: data.fullName };
			if (data.password) {
				payload.password = data.password;
				payload.oldPassword = data.oldPassword;
			}

			const response = await updateUser(profileUser.id, payload);
			setProfileUser(response.data);
			setIsEditing(false);
			reset({
				fullName: response.data.fullName,
				password: "",
				oldPassword: "",
			});
			alert("Данные успешно обновлены");
		} catch (err) {
			console.error(err);
			setServerError(
				err.response?.data.message || "Произошла ошибка при сохранении",
			);
		}
	};

	if (authLoading || loading) return <Loader />;
	if (error) return <ErrorPage error={error} />;
	if (!profileUser) return null;

	const isOwnProfile = !id || (authUser && id === authUser.id);

	return (
		<div className="profile container">
			<header className="profile__header">
				<h1 className="profile__title">
					{isOwnProfile ? "Личное дело" : "Профиль пользователя"}
				</h1>
				{isOwnProfile && (
					<button
						className={`profile__edit-btn ${isEditing ? "profile__edit-btn--active" : ""}`}
						onClick={() => {
							setIsEditing(!isEditing);
							if (isEditing) reset();
						}}
					>
						{isEditing ? "Отмена" : "Редактировать"}
					</button>
				)}
			</header>

			<main className="profile__content">
				{isEditing ? (
					<form
						className="profile__form edit-form"
						onSubmit={handleSubmit(onSubmit)}
					>
						<div className="user-card__group">
							<label className="user-card__label">
								Полное имя
							</label>
							<input
								{...register("fullName", {
									required: "Это поле обязательно",
								})}
								className={`edit-form__input ${errors.fullName ? "edit-form__input--error" : ""}`}
							/>
							{errors.fullName && (
								<span className="edit-form__error">
									{errors.fullName.message}
								</span>
							)}
						</div>

						<div className="edit-form__section">
							<h3 className="edit-form__subtitle">
								Безопасность
							</h3>

							<div className="user-card__group">
								<label className="user-card__label">
									Текущий пароль
								</label>
								<input
									type="password"
									className={`edit-form__input ${errors.oldPassword ? "edit-form__input--error" : ""}`}
									{...register("oldPassword", {
										validate: (val) => {
											if (watch("password") && !val)
												return "Введите текущий пароль для смены";
										},
									})}
								/>
								{errors.oldPassword && (
									<span className="edit-form__error">
										{errors.oldPassword.message}
									</span>
								)}
							</div>

							<div className="user-card__group">
								<label className="user-card__label">
									Новый пароль
								</label>
								<input
									type="password"
									className={`edit-form__input ${errors.password ? "edit-form__input--error" : ""}`}
									{...register("password", {
										minLength: {
											value: 6,
											message: "Минимум 6 символов",
										},
									})}
								/>
								{errors.password && (
									<span className="edit-form__error">
										{errors.password.message}
									</span>
								)}
							</div>
							{serverError && (
								<div className="edit-form__error">
									{serverError}
								</div>
							)}
						</div>

						<button
							type="submit"
							className="profile__save-btn"
							disabled={isSubmitting}
						>
							{isSubmitting
								? "Сохранение..."
								: "Зафиксировать изменения"}
						</button>
					</form>
				) : (
					<div className="profile__card user-card">
						<div className="user-card__aside">
							<div className="user-card__avatar-wrapper">
								{profileUser.avatarUrl ? (
									<img
										src={profileUser.avatarUrl}
										alt=""
										className="user-card__avatar"
									/>
								) : (
									<div className="user-card__avatar-placeholder">
										{profileUser.fullName?.charAt(0)}
									</div>
								)}
							</div>
							<div className="user-card__status-badge">
								Активен
							</div>
						</div>

						<div className="user-card__main">
							<div className="user-card__group">
								<label className="user-card__label">
									Полное имя
								</label>
								<div className="user-card__value user-card__value--accent">
									{profileUser.fullName}
								</div>
							</div>
							<div className="user-card__grid">
								<div className="user-card__group">
									<label className="user-card__label">
										Email
									</label>
									<div className="user-card__value">
										{profileUser.email}
									</div>
								</div>
								<div className="user-card__group">
									<label className="user-card__label">
										Роль
									</label>
									<div className="user-card__value">
										<span className="user-card__role-tag">
											{profileUser.role?.name}
										</span>
									</div>
								</div>
								<div className="user-card__group">
									<label className="user-card__label">
										Организация
									</label>
									<div className="user-card__value">
										{profileUser.organization?.name}
									</div>
								</div>
								<div className="user-card__group">
									<label className="user-card__label">
										Зарегистрирован
									</label>
									<div className="user-card__value">
										{isoToRuDate(profileUser.createdAt)}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
