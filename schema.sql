CREATE DATABASE library_db;
USE library_db;

-- Lugejad
CREATE TABLE lugejad (
    lugeja_id INT AUTO_INCREMENT PRIMARY KEY,
    eesnimi VARCHAR(50) NOT NULL,
    perenimi VARCHAR(50) NOT NULL,
    telefon VARCHAR(15),
    email VARCHAR(100),
    aadress VARCHAR(200),
    registreeritud DATE DEFAULT CURRENT_DATE
);

-- Autorid
CREATE TABLE autorid (
    autor_id INT AUTO_INCREMENT PRIMARY KEY,
    eesnimi VARCHAR(50) NOT NULL,
    perenimi VARCHAR(50) NOT NULL,
    synniaasta INT
);

-- Raamatud
CREATE TABLE raamatud (
    raamatu_id INT AUTO_INCREMENT PRIMARY KEY,
    pealkiri VARCHAR(200) NOT NULL,
    isbn VARCHAR(20),
    aasta INT,
    keel VARCHAR(30),
    eksemplare INT DEFAULT 1,
    saadaval INT DEFAULT 1
);

-- Seos
CREATE TABLE raamatu_autor (
    raamatu_id INT,
    autor_id INT,
    PRIMARY KEY (raamatu_id, autor_id),
    FOREIGN KEY (raamatu_id) REFERENCES raamatud(raamatu_id),
    FOREIGN KEY (autor_id) REFERENCES autorid(autor_id)
);

-- Laenutus
CREATE TABLE laenutus (
    laenutus_id INT AUTO_INCREMENT PRIMARY KEY,
    lugeja_id INT,
    raamatu_id INT,
    laenutus_kp DATE DEFAULT CURRENT_DATE,
    tagastus_tp DATE,
    tagastatud_kp DATE,
    FOREIGN KEY (lugeja_id) REFERENCES lugejad(lugeja_id),
    FOREIGN KEY (raamatu_id) REFERENCES raamatud(raamatu_id),
    CHECK (tagastus_tp >= laenutus_kp)
);







CREATE DATABASE bank_db;
USE bank_db;

CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    balance DECIMAL(10,2)
);

CREATE TABLE fines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(10,2),
    days_late INT
);





INSERT INTO accounts (user_id, balance) VALUES (1, 20.00);
INSERT INTO accounts (user_id, balance) VALUES (2, 15.00);
INSERT INTO accounts (user_id, balance) VALUES (3, 30.00);




USE library_db;

INSERT INTO raamatud (pealkiri, aasta, keel, eksemplare, saadaval) VALUES
('Keisri hull', 1978, 'eesti', 3, 3),
('Rehepapp', 2000, 'eesti', 4, 4),
('Metro 2033', 2005, 'vene', 2, 2),
('1984', 1949, 'inglise', 5, 5),
('The Hobbit', 1937, 'inglise', 3, 3),
('Harry Potter', 1997, 'inglise', 6, 6),
('Master and Margarita', 1967, 'vene', 2, 2),
('War and Peace', 1869, 'vene', 2, 2);




INSERT INTO lugejad (eesnimi, perenimi) VALUES ('Test', 'User');

INSERT INTO laenutus (lugeja_id, raamatu_id, laenutus_kp, tagastus_tp, tagastatud_kp)
VALUES (1, 1, '2025-04-01', '2025-04-10', '2025-04-15'); 
-- 5 дней просрочки