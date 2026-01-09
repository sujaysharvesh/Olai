import {
    FoldersByUserId,
    createFolderForUser,
    deleteFolder,
    updateFolderName
  } from "@/db/querie/folderQuerie";
  
  export const FolderService = {
    async createFolder(name: string, userId: string) {
      if (!name || !userId) {
        throw new Error("Folder name and user ID are required");
      }
  
      return await createFolderForUser(name.trim(), userId);
    },
  
    // async getAllFolders(userId: string) {
    //   if (!userId) {
    //     throw new Error("User ID is required");
    //   }
  
    //   return await FoldersByUserId(userId);
    // },
  
    async deleteFolderById(folderId: string) {
      if (!folderId) {
        throw new Error("Folder ID is required");
      }
  
      await deleteFolder(folderId);
    },
  
    async updateFolder(folderId: string, name: string) {
      if (!folderId || !name) {
        throw new Error("Folder ID and name are required");
      }
  
      const response = await updateFolderName(folderId, name);
  
      if (response.rowCount === 0) {
        throw new Error("Folder not found or update failed");
      }
  
      return response.rows[0];
    },

    async createDefaultFolder(userId: string) {

        const defaultFolderName = "Home";
        return await createFolderForUser(defaultFolderName, userId);
    
    },

    async getAllFolders(userId: string) {
      if (!userId) {
        throw new Error("User ID is required");
      }
  
      return await FoldersByUserId(userId);
    },
  };
