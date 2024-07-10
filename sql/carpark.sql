CREATE TABLE CarParks (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    car_park_no VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    x_coord FLOAT NOT NULL,
    y_coord FLOAT NOT NULL,
    car_park_type_id INT,
    type_of_parking_system_id INT,
    short_term_parking_id INT,
    free_parking VARCHAR(50),
    night_parking VARCHAR(50),
    car_park_decks INT,
    gantry_height FLOAT,
    car_park_basement VARCHAR(50),
    FOREIGN KEY (car_park_type_id) REFERENCES CarParkTypes(ID),
    FOREIGN KEY (type_of_parking_system_id) REFERENCES ParkingSystemType(ID),
    FOREIGN KEY (short_term_parking_id) REFERENCES ShortTermParking(ID)
);

CREATE TABLE CarParkTypes (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Car_Park_TypeName VARCHAR(150) NOT NULL
);

CREATE TABLE ParkingSystemType (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Parking_System_Name VARCHAR(150) NOT NULL
);


CREATE TABLE ShortTermParking (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Short_Term_Parking_Description VARCHAR(255) NOT NULL
);

CREATE TABLE Favorites (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    car_park_id INT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    user_address VARCHAR(255) NOT NULL,
    FOREIGN KEY (car_park_id) REFERENCES CarParks(ID)
);
