-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "humidity" INTEGER NOT NULL,
    "temperature_c" INTEGER NOT NULL,
    "temperature_f" INTEGER NOT NULL,
    "heat_index_c" INTEGER NOT NULL,
    "heat_index_f" INTEGER NOT NULL,
    "mq135_value" INTEGER NOT NULL,
    "voltage" INTEGER NOT NULL,
    "dust_concentration" INTEGER NOT NULL
);
