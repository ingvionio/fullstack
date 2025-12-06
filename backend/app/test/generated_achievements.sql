-- Сгенерированные достижения (achievements)
-- Достижения должны быть созданы, но изначально непройденными
-- Они будут закрываться в зависимости от прогресса пользователя

-- Достижения по количеству отзывов (marks_count)
INSERT INTO achievements (name, description, achievement_type, requirement_value, xp_reward, created_at) 
VALUES ('Первый отзыв', 'Оставьте свой первый отзыв', 'marks_count', 1, 25, datetime('now'));

INSERT INTO achievements (name, description, achievement_type, requirement_value, xp_reward, created_at) 
VALUES ('Активный рецензент', 'Оставьте 10 отзывов', 'marks_count', 10, 100, datetime('now'));

INSERT INTO achievements (name, description, achievement_type, requirement_value, xp_reward, created_at) 
VALUES ('Эксперт по отзывам', 'Оставьте 50 отзывов', 'marks_count', 50, 500, datetime('now'));

INSERT INTO achievements (name, description, achievement_type, requirement_value, xp_reward, created_at) 
VALUES ('Мастер отзывов', 'Оставьте 100 отзывов', 'marks_count', 100, 1000, datetime('now'));

-- Достижения по количеству точек (points_count)
INSERT INTO achievements (name, description, achievement_type, requirement_value, xp_reward, created_at) 
VALUES ('Первый объект', 'Создайте свою первую точку на карте', 'points_count', 1, 50, datetime('now'));

INSERT INTO achievements (name, description, achievement_type, requirement_value, xp_reward, created_at) 
VALUES ('Картограф', 'Создайте 10 точек на карте', 'points_count', 10, 200, datetime('now'));

INSERT INTO achievements (name, description, achievement_type, requirement_value, xp_reward, created_at) 
VALUES ('Мастер картографии', 'Создайте 50 точек на карте', 'points_count', 50, 1000, datetime('now'));

-- Достижения по серии отзывов (marks_streak)
INSERT INTO achievements (name, description, achievement_type, requirement_value, xp_reward, created_at) 
VALUES ('Ежедневная активность', 'Оставляйте отзывы каждый день на протяжении 3 дней', 'marks_streak', 3, 75, datetime('now'));

INSERT INTO achievements (name, description, achievement_type, requirement_value, xp_reward, created_at) 
VALUES ('Неделя активности', 'Оставляйте отзывы каждый день на протяжении 7 дней', 'marks_streak', 7, 200, datetime('now'));

INSERT INTO achievements (name, description, achievement_type, requirement_value, xp_reward, created_at) 
VALUES ('Декада активности', 'Оставляйте отзывы каждый день на протяжении 10 дней', 'marks_streak', 10, 500, datetime('now'));
