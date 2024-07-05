/*
  Warnings:

  - You are about to drop the `History` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `host` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Device` table. All the data in the column will be lost.
  - Added the required column `connectedDevicesId` to the `Device` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "History";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ConnectedDevices" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "humidity" INTEGER NOT NULL,
    "temperature_c" INTEGER NOT NULL,
    "temperature_f" INTEGER NOT NULL,
    "mq135_value" INTEGER NOT NULL,
    "mq135_statys" TEXT NOT NULL,
    "dust_concentration" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Data" ("dust_concentration", "humidity", "id", "mq135_statys", "mq135_value", "temperature_c", "temperature_f") SELECT "dust_concentration", "humidity", "id", "mq135_statys", "mq135_value", "temperature_c", "temperature_f" FROM "Data";
DROP TABLE "Data";
ALTER TABLE "new_Data" RENAME TO "Data";
CREATE TABLE "new_Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectedDevicesId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    CONSTRAINT "Device_connectedDevicesId_fkey" FOREIGN KEY ("connectedDevicesId") REFERENCES "ConnectedDevices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Device_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Device" ("id") SELECT "id" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
