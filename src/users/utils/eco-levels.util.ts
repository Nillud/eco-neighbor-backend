export const ECO_LEVELS = [
  { name: 'Росток', minScore: 0, color: '#81C784' },
  { name: 'Лесной Страж', minScore: 100, color: '#4CAF50' },
  { name: 'Эко-Активист', minScore: 500, color: '#2E7D32' },
  { name: 'Хранитель Природы', minScore: 1500, color: '#1B5E20' },
  { name: 'Эко-Герой', minScore: 5000, color: '#00C853' },
];

export function getLevelByScore(score: number) {
  return [...ECO_LEVELS].reverse().find(level => score >= level.minScore) || ECO_LEVELS[0];
}