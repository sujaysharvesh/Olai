
import { getUserByEmail, registerUserQuery } from "@/db/user-querie/userQuerie";
import bcrypt from "bcrypt";


const salt = process.env.SALT
const pepper = process.env.PEPPER

export async function registerUser(
    username: string,
    email: string,
    password: string
): Promise<any> {
    if (!username || !email || !password) {
        throw new Error("Missing required fields");
    }

    if (!email.includes("@")) {
        throw new Error("Invalid email format");
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await hashPasswordFunc(password);

    return await registerUserQuery(username, email, hashedPassword);
}

export async function loginUser(email: string, password: string) {

    const user = await getUserByEmail(email);
    if (!user) {
        throw new Error("User not found");
    }

    const isPasswordValid = await comparePasswordFunc(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }

    return user;

}

export async function hashPasswordFunc(password: string) {

    const hash = await bcrypt.hash(password + pepper, parseInt(salt!));
    return hash;

}

export async function comparePasswordFunc(password: string, hashedPassword: string): Promise<boolean> {
    
    const isMatch = await bcrypt.compare(password + pepper, hashedPassword);
    return isMatch;

}