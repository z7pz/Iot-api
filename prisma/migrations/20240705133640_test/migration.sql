/*
  Warnings:

  - Added the required column `mq135_statys` to the `Data` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "humidity" INTEGER NOT NULL,
    "temperature_c" INTEGER NOT NULL,
    "temperature_f" INTEGER NOT NULL,
    "heat_index_c" INTEGER NOT NULL,
    "heat_index_f" INTEGER NOT NULL,
    "mq135_value" INTEGER NOT NULL,
    "mq135_statys" TEXT NOT NULL,
    "voltage" INTEGER NOT NULL,
    "dust_concentration" INTEGER NOT NULL
);
INSERT INTO "new_Data" ("dust_concentration", "heat_index_c", "heat_index_f", "humidity", "id", "mq135_value", "temperature_c", "temperature_f", "voltage") SELECT "dust_concentration", "heat_index_c", "heat_index_f", "humidity", "id", "mq135_value", "temperature_c", "temperature_f", "voltage" FROM "Data";
DROP TABLE "Data";
ALTER TABLE "new_Data" RENAME TO "Data";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
