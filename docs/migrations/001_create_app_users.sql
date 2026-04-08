-- Migration 001: Create app_users table
-- Run this against LuzDeVidaDB before starting the backend.
-- This adds user authentication separate from the domain model.

CREATE TABLE app_users (
    user_id      INT            IDENTITY(1,1) NOT NULL,
    email        NVARCHAR(255)  NOT NULL,
    password_hash NVARCHAR(500) NOT NULL,
    role         NVARCHAR(50)   NOT NULL CONSTRAINT DF_app_users_role DEFAULT 'supporter',
    supporter_id INT            NULL,
    is_active    BIT            NOT NULL CONSTRAINT DF_app_users_is_active DEFAULT 1,
    created_at   DATETIME       NOT NULL CONSTRAINT DF_app_users_created_at DEFAULT GETUTCDATE(),

    CONSTRAINT PK_app_users PRIMARY KEY (user_id),
    CONSTRAINT UQ_app_users_email UNIQUE (email),
    CONSTRAINT FK_app_users_supporters
        FOREIGN KEY (supporter_id) REFERENCES supporters(supporter_id)
);

CREATE INDEX IX_app_users_email ON app_users(email);
