export const DEFAULT_AVATAR = "/images/default-avatar.png";

export const MEDICAL_STATUS = [
	{ value: "injured", label: "Травмирован" },
	{ value: "recovery", label: "Реабилитация" },
	{ value: "recovered", label: "Восстановился" },
];
export const getMedicalLabel = (statusValue) => {
  const status = MEDICAL_STATUS.find(s => s.value === statusValue);
  return status ? status.label : "Неизвестно";
};

const MATCH_STATUS = [
	{ value: "scheduled", label: "Запланирован" },
	{ value: "in_progress", label: "В процессе" },
	{ value: "finished", label: "Завершен" },
	{ value: "canceled", label: "Отменен" },
]

export const getMatchStatusLabel = (statusValue) => {
  const status = MATCH_STATUS.find(s => s.value === statusValue);
  return status ? status.label : "Неизвестно";
};

export const CONTRACT_TYPE = [
	{ value: "ONE_WAY", label: "Односторонний" },
	{ value: "TWO_WAY", label: "Двусторонний" },
	{ value: "ENTRY_LEVEL", label: "Контракт новичка" },
	{ value: "TRY_OUT", label: "Просмотровый" },
]

export const getContractTypeLabel = (statusValue) => {
  const status = CONTRACT_TYPE.find(s => s.value === statusValue);
  return status ? status.label : "Неизвестно";
};

export const TRANSFER_TYPE = [
	{ value: "external", label: "Внешний" },
	{ value: "internal", label: "Внутренний" },
]

export const getTransferTypeLabel = (transferValue) => {
  const status = TRANSFER_TYPE.find(s => s.value === transferValue);
  return status ? status.label : "Неизвестно";
};

export const TRAINING_TYPES = [
	{ value: "ice", label: "Лед" },
	{ value: "gym", label: "Тренажерный зал" },
	{ value: "theory", label: "Теория" },
	{ value: "recovery", label: "Восстановление" },
	{ value: "game", label: "Игровая" },
];
export const getTrainingStatusLabel = (statusValue) => {
  const status = TRAINING_TYPES.find(s => s.value === statusValue);
  return status ? status.label : "Неизвестно";
};
export const MATCH_TYPES = [
	{ value: "league", label: "Лига" },
	{ value: "playoff", label: "Плей-офф" },
	{ value: "offseason", label: "Подготовительный" },
];

export const SEASON_TYPES = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => {
	const startYear = 2025 + i;
	const endYear = startYear + 1;
	return `${startYear}/${endYear}`;
});

export const METRIC_TYPES = [
	{ value: "height", label: "Рост (см)", unit: "см" },
	{ value: "weight", label: "Вес (кг)", unit: "кг" },
	{ value: "fat_percentage", label: "Процент жира", unit: "%" },
	{ value: "muscle_mass", label: "Мышечная масса", unit: "кг" },

	{ value: "vertical_jump", label: "Вертикальный прыжок", unit: "см" },
	{ value: "broad_jump", label: "Прыжок в длину с места", unit: "см" },
	{ value: "bench_press_max", label: "Жим лежа (макс. вес)", unit: "кг" },
	{ value: "pull_ups", label: "Подтягивания (кол-во)", unit: "раз" },

	{ value: "sprint_30m_off_ice", label: "Бег 30м (зал)", unit: "сек" },
	{ value: "shuttle_run_6x9", label: "Челночный бег 6х9м", unit: "сек" },
	{ value: "pro_agility_test", label: "Тест 5-10-5 (ловкость)", unit: "сек" },

	{
		value: "skating_sprint_30m",
		label: "Спринт на коньках 30м",
		unit: "сек",
	},
	{
		value: "skating_agility_illinois",
		label: "Иллинойс на льду",
		unit: "сек",
	},
	{
		value: "transition_test",
		label: "Тест на маневренность (лицом/спиной)",
		unit: "сек",
	},
	{ value: "cooper_test_ice", label: "Тест Купера (лед)", unit: "м" },

	{ value: "vo2_max", label: "МПК (VO2 Max)", unit: "мл/кг/мин" },
	{ value: "resting_heart_rate", label: "ЧСС в покое", unit: "уд/мин" },
	{ value: "grip_strength", label: "Кистевая динамометрия", unit: "кг" },
];

export const getMetricTypeLabel = (metricValue) => {
	const status = METRIC_TYPES.find(s => s.value === metricValue);
	return status ? status.label : "Неизвестно";
};
