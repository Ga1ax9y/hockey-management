import Loader from "../../../components/layout/Loader/Loader";
import { useCallback, useEffect, useState } from "react";
import { getRoles, createUser } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import "./Users.css";
import ErrorPage from "../../Error/ErrorPage";

export default function Users() {
	const [roles, setRoles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [form, setForm] = useState({
		email: "",
		password: "",
		fullName: "",
		roleId: "",
		avatarUrl: null,
	});
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const [preview, setPreview] = useState(null);

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setForm({ ...form, avatar: file });
			setPreview(URL.createObjectURL(file));
		}
	};
	const handlePrintCard = () => {
		const roleName =
			roles.find((r) => r.id == form.roleId)?.name || "Не указана";

		const printWindow = window.open("", "_blank");
		printWindow.document.write(`
        <html>
            <head>
                <title>Учетная карточка - ${form.fullName}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; }
                    .card { border: 2px solid #000; padding: 30px; max-width: 600px; margin: 0 auto; position: relative; }
                    .header { border-bottom: 2px solid #000; margin-bottom: 20px; padding-bottom: 10px; }
                    .title { text-transform: uppercase; font-weight: 900; font-size: 20px; margin: 0; }
                    .info-row { margin: 15px 0; font-size: 14px; }
                    .label { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #666; display: block; }
                    .value { font-size: 18px; font-weight: 500; display: block; margin-top: 4px; }
                    .credentials { background: #f0f0f0; padding: 15px; margin-top: 20px; border: 1px dashed #000; }
                    .signatures { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                    .sig-block { border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 12px; text-transform: uppercase; }
                    .stamp { position: absolute; bottom: 100px; right: 50px; border: 3px solid rgba(0,0,0,0.1); width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; transform: rotate(-15deg); }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <p class="title">Hockey Management System</p>
                        <p style="margin:0; font-size: 12px;">Учетные данные доступа к платформе</p>
                    </div>

                    <div class="info-row">
                        <span class="label">Владелец аккаунта</span>
                        <span class="value">${form.fullName || "__________________________"}</span>
                    </div>

                    <div class="info-row">
                        <span class="label">Роль в организации</span>
                        <span class="value">${roleName}</span>
                    </div>

                    <div class="credentials">
                        <div class="info-row">
                            <span class="label">Логин (Email)</span>
                            <span class="value">${form.email || "не указан"}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Временный пароль</span>
                            <span class="value" style="font-family: monospace; letter-spacing: 1px;">${form.password}</span>
                        </div>
                    </div>

                    <p style="font-size: 10px; color: #555; margin-top: 20px;">
                        * При первом входе рекомендуется сменить временный пароль в личном кабинете.
                    </p>
					<p style="font-size: 10px; color: #555; margin-top: 20px;">
						** При подписи получатель дает согласие на обработку персональных данных и регистрируется в системе.
                    </p>

                    <div class="signatures">
                        <div class="sig-block">Менеджер организации</div>
                        <div class="sig-block">Получатель (подпись)</div>
                    </div>

                    <div class="stamp">М.П.</div>
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `);
		printWindow.document.close();
	};

	const handleClearAvatar = () => {
		setForm({ ...form, avatarUrl: "" });
		setPreview(null);
	};
	const generatePassword = (length = 12) => {
		const chars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
		let password = "";
		for (let i = 0; i < length; i++) {
			password += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return password;
	};

	const loadRoles = useCallback(async () => {
		try {
			setLoading(true);
			const res = await getRoles();
			setRoles(res.data.data);
		} catch (err) {
			setError("Не удалось загрузить роли");
			setError(err.response?.data);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadRoles();
		setForm((prev) => ({ ...prev, password: generatePassword() }));
	}, [loadRoles]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleRegeneratePassword = () => {
		setIsGenerating(true);
		setForm({ ...form, password: generatePassword() });
		setTimeout(() => setIsGenerating(false), 500);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			formData.append("fullName", form.fullName);
			formData.append("email", form.email);
			formData.append("password", form.password);
			formData.append("roleId", form.roleId);

			if (form.avatar) {
				formData.append("avatar", form.avatar);
			}

			await createUser(formData);
			navigate("/management/users");
		} catch (err) {
			setError(err.response?.data);
			setIsSubmitting(false);
		}
	};

	if (loading) return <Loader />;

	return (
		<div className="user-create container">
			<header className="user-create__header">
				<h1 className="user-create__title">
					Регистрация нового аккаунта
				</h1>
				<p className="user-create__subtitle">
					Создание учетной записи пользователя
				</p>
			</header>

			<form
				className="user-create__form user-form"
				onSubmit={handleSubmit}
			>
				<div className="user-form__section">
					<label className="user-form__label">Фото профиля</label>
					<div className="avatar-upload">
						<div className="avatar-upload__preview">
							{preview ? (
								<img
									src={preview}
									alt="Preview"
									className="avatar-upload__img"
								/>
							) : (
								<div className="avatar-upload__placeholder">
									НЕТ ФОТО
								</div>
							)}
						</div>
						<div className="avatar-upload__controls">
							<label className="avatar-upload__btn avatar-upload__btn--select">
								Выбрать файл
								<input
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									hidden
								/>
							</label>
							{preview && (
								<button
									type="button"
									className="avatar-upload__btn avatar-upload__btn--clear"
									onClick={handleClearAvatar}
								>
									Удалить
								</button>
							)}
						</div>
					</div>
				</div>

				<div className="user-form__grid">
					<div className="user-form__group">
						<label className="user-form__label">
							ФИО полностью
						</label>
						<input
							className="user-form__input"
							name="fullName"
							placeholder="Иванов Иван Иванович"
							value={form.fullName}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="user-form__group">
						<label className="user-form__label">Email адрес</label>
						<input
							className="user-form__input"
							name="email"
							type="email"
							placeholder="example@hockey.ru"
							value={form.email}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="user-form__group">
						<label className="user-form__label">
							Роль в организации
						</label>
						<select
							className="user-form__input user-form__input--select"
							value={form.roleId}
							name="roleId"
							onChange={handleChange}
							required
						>
							<option value="">Выберите роль...</option>
							{roles.map((role) => (
								<option key={role.id} value={role.id}>
									{role.name}
								</option>
							))}
						</select>
					</div>

					<div className="user-form__group">
						<label className="user-form__label">
							Временный пароль
						</label>
						<div className="user-form__password-wrapper">
							<input
								className="user-form__input"
								type="text"
								name="password"
								value={form.password}
								onChange={handleChange}
							/>
							<button
								type="button"
								onClick={handleRegeneratePassword}
								className={`user-form__regen-btn ${isGenerating ? "user-form__regen-btn--spinning" : ""}`}
								title="Сгенерировать заново"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
							</button>
						</div>
					</div>
				</div>

				<footer className="user-form__footer">
					<button
						className="user-form__print-btn"
						type="button"
						onClick={handlePrintCard}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							style={{ marginRight: "8px" }}
						>
							<path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
							<path d="M6 14h12v8H6z" />
						</svg>
						Печать карточки
					</button>
					<button
						className={`user-form__submit-btn ${isSubmitting ? "user-form__submit-btn--loading" : ""}`}
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<span className="user-form__loader-wrapper">
								<span className="user-form__spinner"></span>
								Регистрация...
							</span>
						) : (
							"Зарегистрировать пользователя"
						)}
					</button>
					{error && <p className="user-form__error">{error}</p>}
				</footer>
			</form>
		</div>
	);
}
