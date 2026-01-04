import {
  getUserByEmail,
  oauthUser,
  registerUserQuery,
} from "@/db/querie/userQuerie";
import bcrypt from "bcrypt";
import type { JwtPayLoad, LoginResponse } from "../utils/types";
import { authLib } from "@/utils/auth";
import { FolderService } from "./folderService";

const salt = process.env.SALT;
const pepper = process.env.PEPPER;

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
  // console.log(username, email, password)

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPasswordFunc(password);

  const response = await registerUserQuery(username, email, hashedPassword);

  if (!response) {
    throw new Error("User registration failed");
  }

  const createDefault = await FolderService.createDefaultFolder(response.id);

  // console.log("Create default folder response:", createDefault);

  if (!createDefault) {
    throw new Error("Failed to create default folder for user");
  }

  return response;
}

export async function registerOauthUser(
  username: string,
  email: string,
  provider: string,
  providerId: string
) {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return existingUser;
  }

  const response = await oauthUser(username, email, provider, providerId);
  if (!response) {
    throw new Error("User registration failed");
  }

  if (!response) {
    throw new Error("OAuth User registration failed");
  }

  const createDefault = FolderService.createDefaultFolder(response.id);
  if (!createDefault) {
    throw new Error("Failed to create default folder for OAuth user");
  }

  return response;
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  // console.log("User found:", user);

  const isPasswordValid = await comparePasswordFunc(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const payload: JwtPayLoad = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  const token = authLib.generateToken(payload);

  const response: LoginResponse = {
    token: token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
  // console.log("Login response:", response);

  return response;
}

export async function hashPasswordFunc(password: string) {
  const hash = await bcrypt.hash(password + pepper, parseInt(salt!));
  return hash;
}

export async function comparePasswordFunc(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(password + pepper, hashedPassword);
  return isMatch;
}
