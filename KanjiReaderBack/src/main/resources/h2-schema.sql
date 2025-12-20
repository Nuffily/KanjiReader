--CREATE TABLE IF NOT EXISTS "UserTable"(
--    "uuid" uuid NOT NULL PRIMARY KEY,
--    "name" VARCHAR(255),
--    "age" int
--);

--CREATE TABLE IF NOT EXISTS "UserTable" (
--    "uuid" uuid NOT NULL PRIMARY KEY,
--    "login" VARCHAR(30) UNIQUE,
--    "password" VARCHAR(30)
--);
--
--CREATE TABLE IF NOT EXISTS "UserTimeStat" (
--    "uuid" uuid NOT NULL PRIMARY KEY,
--    "11" SMALLINT DEFAULT 0,
--    "16" SMALLINT DEFAULT 0,
--    "21" SMALLINT DEFAULT 0,
--    "26" SMALLINT DEFAULT 0,
--    "31" SMALLINT DEFAULT 0,
--    "36" SMALLINT DEFAULT 0,
--    "41" SMALLINT DEFAULT 0,
--    "46" SMALLINT DEFAULT 0,
--    "51" SMALLINT DEFAULT 0,
--    "56" SMALLINT DEFAULT 0
--);


CREATE TABLE IF NOT EXISTS "UserTable" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "experience" INT NOT NULL,
    "refill" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Quest" (
    "entry_id" BIGSERIAL PRIMARY KEY,
    "user_id" BIGINT NOT NULL,
    "quest_type" TINYINT NOT NULL,
    "word_list" TINYINT NOT NULL,
    "progress" TINYINT,
    "parameter" TINYINT,
    "is_complete" BIT NOT NULL,

CONSTRAINT fk_quest_user
        FOREIGN KEY ("user_id")  -- Added quotes here
        REFERENCES "UserTable"("id") -- Added quotes to "id" for safety too
);