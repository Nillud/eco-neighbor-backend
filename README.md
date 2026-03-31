# 🌍 EcoNeighbor Backend

**EcoNeighbor** — это социально-экологическая платформа для жителей районов. Приложение помогает соседям объединяться для раздельного сбора вторсырья, обмена вещами и организации локальных эко-событий (субботников).

## 🚀 Основные возможности
* **OAuth Yandex:** Быстрая регистрация и вход через Яндекс ID.
* **Эко-Карта:** Интерактивная карта пунктов приема вторсырья (батарейки, пластик, стекло и др.).
* **Система Лиг и достижений:** Геймификация действий пользователя (от «Ростка» до «Эко-Героя»).
* **Объявления (Recycle & Giveaway):** Передача вещей даром или поиск соседей для совместного вывоза вторсырья.
* **События:** Организация и запись на локальные экологические мероприятия с контролем количества участников.

---

## 🛠 Стек технологий
* **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
* **Database:** PostgreSQL
* **ORM:** [Prisma](https://www.prisma.io/)
* **Documentation:** [Swagger (OpenAPI 3.0)](https://swagger.io/)
* **Auth:** JWT + Passport (Yandex Strategy)
* **Testing:** Jest

---

## ⚙️ Установка и запуск

### 1. Клонирование репозитория
```bash
git clone [https://github.com/YourUsername/eco-neighbor-backend.git](https://github.com/YourUsername/eco-neighbor-backend.git)
cd eco-neighbor-backend
```

### 2. Настройка окружения
Создайте файл .env в корне проекта и заполните его:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/eco_db"
JWT_SECRET="your_super_secret_key"

YANDEX_CLIENT_ID="your_yandex_id"
YANDEX_CLIENT_SECRET="your_yandex_secret"
YANDEX_CALLBACK_URL="http://localhost:3000/api/auth/yandex/callback"
```

### 3. Установка зависимостей
Создайте файл .env в корне проекта и заполните его:

```bash
npm install
```

### 4. Настройка базы данных

```bash
# Применение миграций
npx prisma migrate dev --name init

# Наполнение базы стартовыми данными (ачивки, типы отходов)
npx prisma db seed
```

### 5. Запуск сервера

```bash
# Режим разработки
npm run start:dev
```

## 📖 API Документация

После запуска проекта документация доступна по адресу:
👉 `http://localhost:3000/api/docs`

## 🏆 Система Геймификации

### Расчет EcoScore:

* Создание объявления: +15 очков
* Добавление точки на карту: +40 очков
* Участие в событии: +25 очков

### Лиги:

* 🌱 Росток (от 0 очков)
* 🛡️ Лесной Страж (от 100 очков)
* 🔋 Эко-Активист (от 500 очков)
* 🌳 Хранитель Природы (от 1500 очков)
* ⚡ Эко-Герой (от 5000 очков)