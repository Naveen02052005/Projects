-- -- & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p

CREATE TABLE UserDetails(
    id VARCHAR(50) PRIMARY KEY,
    userName VARCHAR(50),
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL
);

CREATE TABLE Feedback(
    feedbackId VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50),
    message TEXT,
    sentiment VARCHAR(50),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES UserDetails(id)
);   


CREATE TABLE SERVICETYPE(
    typeId int AUTO_INCREMENT PRIMARY KEY,
    feedbackId VARCHAR(50),
    typeofCategory VARCHAR(50),
    categoryName VARCHAR(50),
    FOREIGN KEY(feedbackId) REFERENCES Feedback(feedbackId)
);


CREATE TABLE admin(
    id int AUTO_INCREMENT PRIMARY KEY,
    adminName VARCHAR(60),
    email VARCHAR(60),
    password VARCHAR(60)
);