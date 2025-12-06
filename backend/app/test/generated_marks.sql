-- Сгенерированные оценки (marks) для точек в Туле
-- Все оценки от пользователя с id = 1
-- question_ids, answers, weights должны соответствовать критериям отрасли точки
-- Критерии для отрасли 1 (медицинские): id 1-6
-- Критерии для отрасли 2 (спортивные): id 7-11
-- Критерии для отрасли 3 (магазины): id 12-16
-- Критерии для отрасли 4 (общепит): id 17-21
-- Критерии для отрасли 7 (природные зоны): id 32-33

-- Оценки для точек медицинских учреждений (industry_id = 1)
-- Используем критерии 1, 2, 3 (Состояние оборудования, Чистота, Безопасность)
-- total_score = (4*1.0 + 5*1.0 + 4*1.0) / 3 = 4.33
INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (1, 1, '[1, 2, 3]', '[4, 5, 4]', '[1.0, 1.0, 1.0]', 4.33);

INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (2, 1, '[1, 2, 3]', '[5, 4, 5]', '[1.0, 1.0, 1.0]', 4.67);

-- Оценки для спортивных объектов (industry_id = 2)
-- Используем критерии 7, 8, 9 (Удобство, Наличие продукции, Итоговая рекомендация)
INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (3, 1, '[7, 8, 9]', '[4, 4, 4]', '[1.0, 1.0, 1.0]', 4.0);

INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (4, 1, '[7, 8, 9]', '[5, 5, 4]', '[1.0, 1.0, 1.0]', 4.67);

-- Оценки для магазинов (industry_id = 3)
-- Используем критерии 12, 13, 14 (Наличие здорового ассортимента, Наличие вредного ассортимента, Соблюдение санитарных норм)
INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (5, 1, '[12, 13, 14]', '[3, 4, 3]', '[1.0, 1.0, 1.0]', 3.33);

INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (6, 1, '[12, 13, 14]', '[5, 5, 5]', '[1.0, 1.0, 1.0]', 5.0);

INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (7, 1, '[12, 13, 14]', '[4, 5, 4]', '[1.0, 1.0, 1.0]', 4.33);

-- Оценки для общепита (industry_id = 4)
-- Используем критерии 17, 18, 19 (Общий комфорт, Близость к жилым зонам, Запах поблизости)
INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (8, 1, '[17, 18, 19]', '[3, 3, 3]', '[1.0, 1.0, 1.0]', 3.0);

INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (9, 1, '[17, 18, 19]', '[4, 4, 4]', '[1.0, 1.0, 1.0]', 4.0);

INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (10, 1, '[17, 18, 19]', '[5, 5, 5]', '[1.0, 1.0, 1.0]', 5.0);

-- Оценки для природных зон отдыха (industry_id = 7)
-- Используем критерии 30, 31, 32 (Доступность и удобство расположения, Качество услуг, Отношение персонала)
INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (11, 1, '[30, 31, 32]', '[5, 5, 5]', '[1.0, 1.0, 1.0]', 5.0);

INSERT INTO marks (point_id, user_id, question_ids, answers, weights, total_score) 
VALUES (12, 1, '[30, 31, 32]', '[4, 5, 4]', '[1.0, 1.0, 1.0]', 4.33);

