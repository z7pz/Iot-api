/*
  Warnings:

  - You are about to drop the column `heat_index_c` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `heat_index_f` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `voltage` on the `Data` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "humidity" INTEGER NOT NULL,
    "temperature_c" INTEGER NOT NULL,
    "temperature_f" INTEGER NOT NULL,
    "mq135_value" INTEGER NOT NULL,
    "mq135_statys" TEXT NOT NULL,
    "dust_concentration" INTEGER NOT NULL
);
INSERT INTO "new_Data" ("dust_concentration", "humidity", "id", "mq135_statys", "mq135_value", "temperature_c", "temperature_f") SELECT "dust_concentration", "humidity", "id", "mq135_statys", "mq135_value", "temperature_c", "temperature_f" FROM "Data";
DROP TABLE "Data";
ALTER TABLE "new_Data" RENAME TO "Data";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
