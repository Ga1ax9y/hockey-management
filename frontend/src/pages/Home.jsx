import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById } from "../services/api";

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const userId = decoded.id;

        const res = await getUserById(userId, token);
        setUser(res.data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [token, navigate]);

  const handleLogout = () => {
    navigate("/login");
    location.reload()
  };

  if (!user) return <p>Загрузка...</p>;

  return (
    <div>
      <h1>Добро пожаловать, {user.full_name}!</h1>
      {user.role_id === 2 && <p>Администратор</p>}
      <p>Email: {user.email}</p>
      <p>Роль: {user.role_id}</p>
      <p>Активен: {user.is_active ? "Да" : "Нет"}</p>
      <button onClick={handleLogout}>Выйти</button>
    </div>
  );
}
