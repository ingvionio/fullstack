-- Сгенерированные записи user_achievements для пользователя с id = 1
-- Все достижения изначально непройденные (is_completed = 0, progress = 0)
-- Они будут обновляться в зависимости от прогресса пользователя

-- Достижения по количеству отзывов (marks_count)
INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at, created_at) 
VALUES (1, 1, 0, 0, NULL, datetime('now'));

INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at, created_at) 
VALUES (1, 2, 0, 0, NULL, datetime('now'));

INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at, created_at) 
VALUES (1, 3, 0, 0, NULL, datetime('now'));

INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at, created_at) 
VALUES (1, 4, 0, 0, NULL, datetime('now'));

-- Достижения по количеству точек (points_count)
INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at, created_at) 
VALUES (1, 5, 0, 0, NULL, datetime('now'));

INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at, created_at) 
VALUES (1, 6, 0, 0, NULL, datetime('now'));

INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at, created_at) 
VALUES (1, 7, 0, 0, NULL, datetime('now'));

-- Достижения по серии отзывов (marks_streak)
INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at, created_at) 
VALUES (1, 8, 0, 0, NULL, datetime('now'));

INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at, created_at) 
VALUES (1, 9, 0, 0, NULL, datetime('now'));

INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at, created_at) 
VALUES (1, 10, 0, 0, NULL, datetime('now'));
