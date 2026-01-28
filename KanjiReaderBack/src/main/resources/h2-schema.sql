
CREATE TABLE IF NOT EXISTS "UserTable" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "experience" INT NOT NULL,
    "refill" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS Statistic (
    id BIGINT NOT NULL,
    attempt INT NOT NULL,
    correct INT NOT NULL,
    number INT NOT NULL,
    word_list TINYINT NOT NULL,

    CONSTRAINT pk_statistic PRIMARY KEY (id, word_list, attempt)
);

CREATE TABLE IF NOT EXISTS Quest (
    entry_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quest_type TINYINT NOT NULL,
    word_list TINYINT NOT NULL,
    progress TINYINT,
    parameter TINYINT,
    parameter2 TINYINT,
    is_complete BIT NOT NULL,


    CONSTRAINT fk_quest_user
        FOREIGN KEY (user_id)
        REFERENCES "UserTable"("id")
);