CREATE DATABASE IF NOT EXISTS abril.1490;

USE abril.1490;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    edad INT NOT NULL
);

INSERT INTO usuarios (nombre, edad) VALUES ('Ana', 20);
INSERT INTO usuarios (nombre, edad) VALUES ('Luis', 25);
INSERT INTO usuarios (nombre, edad) VALUES ('Camila', 22);