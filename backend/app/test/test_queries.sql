-- Тестовый SQL-скрипт для проверки логики оценок и агрегирования
-- НЕ запускать автоматически; этот файл содержит примеры INSERT/SELECT/UPDATE.

-- Примечание: структура таблиц соответствует моделям в app/models/db_models.py
-- Если используете SQLite, команды ниже совместимы (JSON поля хранятся как TEXT).

-- 1) Вставим примерные записи
-- Добавить отрасль
INSERT INTO industries(name) VALUES ('Test Industry');

-- Добавить подотрасль (base_score = опорная оценка)
INSERT INTO sub_industries(name, base_score, industry_id) VALUES ('Test Sub', 4.0, 1);

-- Добавить критерии (question ids)
INSERT INTO criteria(text, industry_id) VALUES
  ('Criterion A', 1),
  ('Criterion B', 1),
  ('Criterion C', 1);

-- Добавить пользователя
INSERT INTO users(username, email, hashed_password) VALUES
  ('tester', 'tester@example.com', 'fakehash');

-- Добавить точку, привязанную к подотрасли
INSERT INTO points(name, latitude, longitude, industry_id, sub_industry_id, creator_id) VALUES
  ('Point A', 55.0, 37.0, 1, 1, 1);

-- 2) Вставим оценки (Mark)
-- Формула внутри одной оценки (в коде): total_score = sum(answer_i * weight_i) / sum(weights)
-- Пример 1: answers=[1,4,5], weights=[1,2,1] => total = 1*1+4*2+5*1 = 14, sum(weights)=4 => total_score=3.5
INSERT INTO marks(point_id, user_id, question_ids, answers, weights, total_score) VALUES
  (1, 1, '[1,2,3]', '[1,4,5]', '[1,2,1]', 3.5);

-- Пример 2: answers=[4,5,3], weights=[1,1,2] => total = 4+5+6 = 15, sum(weights)=4 => total_score=3.75
INSERT INTO marks(point_id, user_id, question_ids, answers, weights, total_score) VALUES
  (1, 1, '[1,2,3]', '[4,5,3]', '[1,1,2]', 3.75);

-- Пример 3: ещё одна оценка другого пользователя (ставим user_id NULL — аноним)
INSERT INTO marks(point_id, user_id, question_ids, answers, weights, total_score) VALUES
  (1, NULL, '[1,2,3]', '[5,5,5]', '[5,5,5]', 5.0);

-- 3) Проверочные SELECT'ы
-- Список всех оценок для точки
SELECT id, point_id, user_id, total_score, question_ids, answers, weights, created_at
FROM marks
WHERE point_id = 1;

-- Средний пользовательский балл (user_average), как это делает код:
SELECT AVG(total_score) AS user_average
FROM marks
WHERE point_id = 1;

-- Вычисление итогового рейтинга точки по текущей формуле в codebase:
-- if no marks -> point.mark = sub_industry.base_score
-- else -> point.mark = (user_average + sub_industry.base_score) / 2
SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM marks WHERE point_id = 1) = 0
      THEN (SELECT base_score FROM sub_industries WHERE id = (SELECT sub_industry_id FROM points WHERE id = 1))
    ELSE (
      (SELECT AVG(total_score) FROM marks WHERE point_id = 1)
      + (SELECT base_score FROM sub_industries WHERE id = (SELECT sub_industry_id FROM points WHERE id = 1))
    ) / 2
  END AS computed_point_mark;

-- 4) Пример UPDATE, который применяет вычисленный рейтинг к записи в points
UPDATE points
SET mark = (
  CASE
    WHEN (SELECT COUNT(*) FROM marks WHERE point_id = points.id) = 0
      THEN (SELECT base_score FROM sub_industries WHERE id = points.sub_industry_id)
    ELSE (
      (SELECT AVG(total_score) FROM marks WHERE point_id = points.id)
      + (SELECT base_score FROM sub_industries WHERE id = points.sub_industry_id)
    ) / 2
  END
)
WHERE id = 1;

-- Проверим значение в points
SELECT id, name, mark, sub_industry_id FROM points WHERE id = 1;

-- 5) (Опционально) Взвешенная агрегация по сумме весов каждой оценки
-- Если вы хотите агрегировать оценки разных пользователей, взвешивая каждую оценку по сумме её весов,
-- можно сделать более сложный запрос (работает в SQLite с JSON-функциями: json_each/json_array_length).
-- Пример (если SQLite поддерживает json_each):
-- Для каждой записи marks мы вычисляем sum_of_weights = SUM(value) по json_each(weights),
-- затем агрегируем: weighted_avg = SUM(total_score * sum_of_weights) / SUM(sum_of_weights)

-- Пример запроса (на некоторые версии SQLite может потребоваться адаптация):
-- SELECT
--   SUM(total_score * (SELECT SUM(value) FROM json_each(weights)))
--   / NULLIF(SUM((SELECT SUM(value) FROM json_each(weights))), 0) AS weighted_user_avg
-- FROM marks
-- WHERE point_id = 1;

-- Затем можно использовать weighted_user_avg вместо AVG(total_score) в формуле выше.

-- 6) Очистка тестовых данных (если нужно удалить после проверки)
-- DELETE FROM marks WHERE point_id = 1;
-- DELETE FROM points WHERE id = 1;
-- DELETE FROM users WHERE id = 1;
-- DELETE FROM criteria WHERE industry_id = 1;
-- DELETE FROM sub_industries WHERE industry_id = 1;
-- DELETE FROM industries WHERE id = 1;

-- Конец скрипта
