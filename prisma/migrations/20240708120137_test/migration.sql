/*
  Warnings:

  - You are about to drop the column `dust_concentration` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `mq135_statys` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `mq135_value` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `temperature_c` on the `Data` table. All the data in the column will be lost.
  - You are about to drop the column `temperature_f` on the `Data` table. All the data in the column will be lost.
  - Added the required column `AQI` to the `Data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `AQIStatus` to the `Data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dust_percentage` to the `Data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `temperatureC` to the `Data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `temperatureF` to the `Data` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "AQI" INTEGER NOT NULL,
    "AQIStatus" TEXT NOT NULL,
    "dust_percentage" INTEGER NOT NULL,
    "humidity" INTEGER NOT NULL,
    "temperatureC" INTEGER NOT NULL,
    "temperatureF" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectedDevicesId" TEXT NOT NULL,
    "deviceId" TEXT,
    CONSTRAINT "Data_connectedDevicesId_fkey" FOREIGN KEY ("connectedDevicesId") REFERENCES "ConnectedDevices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Data_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Data" ("connectedDevicesId", "createdAt", "deviceId", "humidity", "id") SELECT "connectedDevicesId", "createdAt", "deviceId", "humidity", "id" FROM "Data";
DROP TABLE "Data";
ALTER TABLE "new_Data" RENAME TO "Data";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
