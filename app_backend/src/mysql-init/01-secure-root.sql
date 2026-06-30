-- ONLY RUN ON FIRST CONTAINER START (mounted to /docker-entrypoint-initdb.d)
-- Fixes auth plugin AND privileges for root@%

-- Ensure root@% exists with compatible auth plugin
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Keep localhost root
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;

FLUSH PRIVILEGES;