-- 1. Добавляем колонку как nullable (чтобы база не ругалась)
ALTER TABLE "Ad" ADD COLUMN "slug" TEXT;

-- 2. Заполняем существующие записи временным значением (например, на основе ID)
-- Это гарантирует уникальность для старых данных
UPDATE "Ad" SET "slug" = 'legacy-ad-' || "id" WHERE "slug" IS NULL;

-- 3. Теперь делаем колонку обязательной
ALTER TABLE "Ad" ALTER COLUMN "slug" SET NOT NULL;

-- 4. Создаем уникальный индекс
CREATE UNIQUE INDEX "Ad_slug_key" ON "Ad"("slug");