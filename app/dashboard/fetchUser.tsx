import { User } from "@/utils/types";
import { useRouter } from "next/router";


export default async function fetchUser(): Promise<User | null> {
    try {
      const response = await fetch("/api/user");
  
      if (!response.ok) {
        return null; 
      }
  
      const data = await response.json();
  
      const user: User = {
        username: data.username,
      };
  
      return user;
    } catch (err) {
      return null;
    }
  }
  