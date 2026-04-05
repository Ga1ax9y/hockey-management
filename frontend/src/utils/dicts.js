export const MEDICAL_STATUS = {
    injured: "Травмирован",
    recovery: "Реабилитация",
    recovered: "Восстановился"
}

export const CONTRACT_TYPE = {
    ONE_WAY: "Односторонний",
    TWO_WAY: "Двусторонний",
    ENTRY_LEVEL: "Контракт новичка",
    TRY_OUT: "Просмотровый"
}

export const TRANSFER_TYPE = {
    "internal": "Внутренний",
    "external": "Внешний"
}

export const TRAINING_TYPES = [
  { value: "ice", label: "Лед" },
  { value: "gym", label: "Тренажерный зал" },
  { value: "theory", label: "Теория" },
  { value: "recovery", label: "Восстановление" },
  { value: "game", label: "Игровая" },
];
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
