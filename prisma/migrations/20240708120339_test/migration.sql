/*
  Warnings:

  - You are about to drop the column `dust_percentage` on the `Data` table. All the data in the column will be lost.
  - Added the required column `dustPercentage` to the `Data` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "AQI" INTEGER NOT NULL,
    "AQIStatus" TEXT NOT NULL,
    "dustPercentage" INTEGER NOT NULL,
    "humidity" INTEGER NOT NULL,
    "temperatureC" INTEGER NOT NULL,
    "temperatureF" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectedDevicesId" TEXT NOT NULL,
    "deviceId" TEXT,
    CONSTRAINT "Data_connectedDevicesId_fkey" FOREIGN KEY ("connectedDevicesId") REFERENCES "ConnectedDevices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Data_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Data" ("AQI", "AQIStatus", "connectedDevicesId", "createdAt", "deviceId", "humidity", "id", "temperatureC", "temperatureF") SELECT "AQI", "AQIStatus", "connectedDevicesId", "createdAt", "deviceId", "humidity", "id", "temperatureC", "temperatureF" FROM "Data";
DROP TABLE "Data";
ALTER TABLE "new_Data" RENAME TO "Data";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
