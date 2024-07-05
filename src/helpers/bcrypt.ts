import bcrypt from "bcrypt";

export const hash = async (data: string, salt: number = 10): Promise<String> => {
    try {
        const result = await bcrypt.hash(data, salt);
        return result;
    } catch (err) {
        console.log("Bcrypt Error during hashing", err);
    }
};
export const compare = async (data: string, encryptedData: string): Promise<boolean> => {
    try {
        const result = await bcrypt.compare(data, encryptedData);
        return result;
    } catch (err) {
        console.log("Bcrypt Error during comparing", err);
    }
};