/*
  Warnings:

  - Added the required column `connectedDevicesId` to the `Data` table without a default value. This is not possible if the table is not empty.

*/
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT,
    "connectedDevicesId" TEXT NOT NULL,
    CONSTRAINT "Data_connectedDevicesId_fkey" FOREIGN KEY ("connectedDevicesId") REFERENCES "ConnectedDevices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Data_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Data" ("createdAt", "dust_concentration", "humidity", "id", "mq135_statys", "mq135_value", "temperature_c", "temperature_f") SELECT "createdAt", "dust_concentration", "humidity", "id", "mq135_statys", "mq135_value", "temperature_c", "temperature_f" FROM "Data";
DROP TABLE "Data";
ALTER TABLE "new_Data" RENAME TO "Data";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
