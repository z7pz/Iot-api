/*
  Warnings:

  - You are about to drop the column `connectedDevicesId` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `connectedDevicesId` on the `Data` table. All the data in the column will be lost.
  - Added the required column `connectedDeviceId` to the `Device` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connectedDeviceId` to the `Data` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectedDeviceId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    CONSTRAINT "Device_connectedDeviceId_fkey" FOREIGN KEY ("connectedDeviceId") REFERENCES "ConnectedDevices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Device_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Device" ("id", "locationId") SELECT "id", "locationId" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
CREATE TABLE "new_Data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "AQI" INTEGER NOT NULL,
    "AQIStatus" TEXT NOT NULL,
    "dustPercentage" INTEGER NOT NULL,
    "humidity" INTEGER NOT NULL,
    "temperatureC" INTEGER NOT NULL,
    "temperatureF" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectedDeviceId" TEXT NOT NULL,
    "deviceId" TEXT,
    CONSTRAINT "Data_connectedDeviceId_fkey" FOREIGN KEY ("connectedDeviceId") REFERENCES "ConnectedDevices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Data_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Data" ("AQI", "AQIStatus", "createdAt", "deviceId", "dustPercentage", "humidity", "id", "temperatureC", "temperatureF") SELECT "AQI", "AQIStatus", "createdAt", "deviceId", "dustPercentage", "humidity", "id", "temperatureC", "temperatureF" FROM "Data";
DROP TABLE "Data";
ALTER TABLE "new_Data" RENAME TO "Data";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
