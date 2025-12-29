import { FoldersByUserId, createFolderForUser, deleteFolder, updateFolderName } from "@/db/querie/folderQuerie";


export async function createFolder(name: string, userId: string) {

    if(!name || !userId) {
        throw new Error("Folder name and user ID are required");
    }

    const response = await createFolderForUser(name, userId)
    return response;
}

export async function createDefaultFolder(userId: string) {

    const defaultFolderName = "Home";
    return await createFolderForUser(defaultFolderName, userId);

}

export async function getAllFolders(userId: string) {

    if(!userId) {
        throw new Error("User ID is required");
    }

    const folders = await FoldersByUserId(userId);
    return folders;

}

export async function deleteFolderById(folderId: string) {
    if(!folderId) {
        throw new Error("Folder ID is required");
    }

    await deleteFolder(folderId);
}

export async function updateFolder(folderId: string, name: string) {
    if(!folderId || !name) {
        throw new Error("Folder ID and name are required");
    }

    const response = await updateFolderName(folderId, name);

    if(response.rows[0].length === 0) {
        throw new Error("Folder not found or update failed");
    }

    return response;

}