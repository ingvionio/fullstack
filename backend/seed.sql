-- Seed data for health-map (SQLite friendly). Run with: sqlite3 health_map.db < seed.sql

PRAGMA foreign_keys = ON;

-- Users
INSERT INTO users (id, username, email, hashed_password, level, xp, avatar_url, avatar_history, created_at)
VALUES
  (1, 'demo', 'demo@example.com', 'hashed-demo-password', 1, 0, NULL, '[]', CURRENT_TIMESTAMP),
  (2, 'alice', 'alice@example.com', 'hashed-alice', 1, 0, NULL, '[]', CURRENT_TIMESTAMP),
  (3, 'bob', 'bob@example.com', 'hashed-bob', 1, 0, NULL, '[]', CURRENT_TIMESTAMP);

-- Industries
INSERT INTO industries (id, name, created_at, updated_at) VALUES
  (1, 'Спорт', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Промышленность', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'Медицина', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 'Магазины/Общепит', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 'Природа/Парки', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 'Мусор/Отходы', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sub-industries
INSERT INTO sub_industries (id, name, base_score, industry_id, created_at, updated_at) VALUES
  (1, 'Фитнес', 3.5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Зал', 3.4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'Завод', 2.5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 'Клиника', 3.8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 'Супермаркет', 3.6, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 'Парк', 4.2, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 'Мусорная площадка', 2.0, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Criteria (questions)
INSERT INTO criteria (id, text, industry_id, created_at, updated_at) VALUES
  -- Спорт / Фитнес
  (1, 'Насколько исправны оборудование и покрытие площадки?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Насколько чисты помещения и инвентарь?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'Насколько доступен и компетентен персонал для безопасности?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 'Насколько свободно и комфортно тренироваться (нет перегрузки)?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 'Насколько удобны сопутствующие услуги (шкафчики, парковка, расписание)?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  -- Промышленность
  (6, 'Расстояние до ближайшего жилого дома (1 – далеко, 5 – близко)', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 'Близость к социальным объектам (1 – далеко, 5 – близко)', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 'Сила неприятного запаха рядом с объектом (1 – нет, 5 – очень сильный)', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 'Самочувствие рядом с объектом (1 – отлично, 5 – хуже)', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 'Субъективная вредность объекта (1 – не вредно, 5 – очень вредно)', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  -- Медицина
  (11, 'Сколько времени ждали приема после назначенного времени (мин)?', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, 'Насколько понятно и полно объяснен диагноз и план действий?', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (13, 'Насколько вежливо и уважительно общался персонал?', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (14, 'Оцените общую чистоту помещений', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (15, 'Насколько вероятно порекомендовать учреждение (0-10)?', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  -- Магазины / Общепит
  (16, 'Насколько свежие и безопасные продукты/блюда?', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (17, 'Насколько чисты помещения и рабочие зоны?', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (18, 'Насколько удобно расположено и организовано место?', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (19, 'Насколько полный и разнообразный ассортимент здоровой продукции?', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (20, 'Насколько вероятно порекомендовать точку (0-10)?', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  -- Спорт / Залы (доп. пул для той же отрасли)
  (21, 'Насколько исправно и ухожено оборудование объекта?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (22, 'Насколько чисты помещения (зал, зоны общего пользования)?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (23, 'Насколько безопасно пользоваться объектом?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (24, 'Насколько комфортна и свободна обстановка (не шумно/не тесно)?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (25, 'Насколько удобны сопутствующие услуги и как легко добраться?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  -- Природа / Парки
  (26, 'Насколько разнообразны зоны для отдыха?', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (27, 'Насколько чиста территория?', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (28, 'Качество воздуха и воды в зоне отдыха', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (29, 'Насколько безопасно находиться на объекте?', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (30, 'Насколько удобно добраться и пользоваться объектом?', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  -- Мусор / Отходы
  (31, 'Насколько удобно пользоваться контейнерами/площадкой?', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (32, 'Насколько чиста площадка и территория вокруг?', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (33, 'Сила неприятного запаха от контейнеров/площадки', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (34, 'Как часто вывозят мусор (редко/иногда/постоянно переполнено)?', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (35, 'Есть ли возможность раздельного сбора?', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Points (sample locations)
INSERT INTO points (id, name, latitude, longitude, mark, industry_id, sub_industry_id, creator_id, created_at, updated_at)
VALUES
  (1, 'Фитнес-центр Лайт', 55.751244, 37.618423, 0.0, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Зал Атлант', 55.760000, 37.630000, 0.0, 1, 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'Завод Пром', 55.820000, 37.600000, 0.0, 2, 3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 'Клиника Здоровье', 55.740000, 37.590000, 0.0, 3, 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 'Супермаркет Фреш', 55.730000, 37.620000, 0.0, 4, 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 'Парк Центральный', 55.700000, 37.570000, 0.0, 5, 6, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 'Мусорная площадка №7', 55.710000, 37.650000, 0.0, 6, 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Marks (evaluations) with comments (no photos)
INSERT INTO marks (id, point_id, user_id, question_ids, answers, weights, comment, photos, total_score, created_at, updated_at)
VALUES
  (1, 1, 1, '[1,2,3,4,5]', '[4,4,5,4,4]', '[1,1,1,1,1]', 'Хорошее состояние и сервис', '[]', 4.2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 2, 2, '[21,22,23,24,25]', '[4,3,4,3,4]', '[1,1,1,1,1]', 'Немного многолюдно, но в целом ок', '[]', 3.6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 3, 3, '[6,7,8,9,10]', '[4,3,4,3,4]', '[1,1,1,1,1]', 'Запах ощутим, рядом жилые дома', '[]', 3.6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 4, 1, '[11,12,13,14,15]', '[3,4,4,4,7]', '[1,1,1,1,1]', 'Вежливо, но ожидание немного', '[]', 4.4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 5, 2, '[16,17,18,19,20]', '[4,4,4,4,8]', '[1,1,1,1,1]', 'Ассортимент хороший, очереди небольшие', '[]', 4.8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 6, 3, '[26,27,28,29,30]', '[5,5,4,4,5]', '[1,1,1,1,1]', 'Чисто и удобно добраться', '[]', 4.6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 7, 1, '[31,32,33,34,35]', '[3,3,4,2,3]', '[1,1,1,1,1]', 'Нужен более частый вывоз', '[]', 3.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 1, 2, '[1,2,3,4,5]', '[5,5,4,4,5]', '[1,1,1,1,1]', 'Отличный зал, всё исправно', '[]', 4.6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 1, 3, '[1,2,3,4,5]', '[4,3,4,3,4]', '[1,1,1,1,1]', 'Нужно обновить часть инвентаря', '[]', 3.8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 2, 1, '[21,22,23,24,25]', '[3,3,3,3,3]', '[1,1,1,1,1]', 'Средний уровень, мало места', '[]', 3.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 5, 3, '[16,17,18,19,20]', '[5,5,4,4,9]', '[1,1,1,1,1]', 'Свежие продукты, удобно оплачивать', '[]', 5.4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, 4, 2, '[11,12,13,14,15]', '[2,3,3,3,6]', '[1,1,1,1,1]', 'Долго ждать, но врачи вежливые', '[]', 3.4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Recalculate point marks based on inserted marks and sub_industry base_score
UPDATE points
SET mark = (
    SELECT
        CASE
            WHEN avg_m IS NULL THEN si.base_score
            ELSE (avg_m + si.base_score) / 2.0
        END
    FROM (
        SELECT point_id, AVG(total_score) AS avg_m
        FROM marks
        GROUP BY point_id
    ) m
    JOIN sub_industries si ON si.id = points.sub_industry_id
    WHERE m.point_id = points.id OR m.point_id IS NULL
);

-- Additional marks to increase criteria counts
INSERT INTO marks (id, point_id, user_id, question_ids, answers, weights, comment, photos, total_score, created_at, updated_at)
VALUES
  (13, 1, 1, '[1,2,3,4,5]', '[5,5,5,4,5]', '[1,1,1,1,1]', 'Ещё один отзыв о фитнесе', '[]', 4.8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (14, 3, 2, '[6,7,8,9,10]', '[2,2,3,3,2]', '[1,1,1,1,1]', 'Промзона с запахом', '[]', 2.4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (15, 4, 3, '[11,12,13,14,15]', '[4,4,4,4,8]', '[1,1,1,1,1]', 'Хорошая клиника, чисто', '[]', 4.8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (16, 5, 2, '[16,17,18,19,20]', '[3,3,3,3,6]', '[1,1,1,1,1]', 'Средний магазин, очереди бывают', '[]', 3.6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Recalculate again after additional marks
UPDATE points
SET mark = (
    SELECT
        CASE
            WHEN avg_m IS NULL THEN si.base_score
            ELSE (avg_m + si.base_score) / 2.0
        END
    FROM (
        SELECT point_id, AVG(total_score) AS avg_m
        FROM marks
        GROUP BY point_id
    ) m
    JOIN sub_industries si ON si.id = points.sub_industry_id
    WHERE m.point_id = points.id OR m.point_id IS NULL
);
