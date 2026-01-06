

export async function createFolderAPI(name:string) {
    
    try {
        const response = await fetch("/api/folders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(name),
        });

        if (!response.ok) {
            throw new Error("Failed to create folder");
        }

        const data = await response.json();

        return data.folder;
    } catch (err) {
        throw new Error(`Error creating folder: ${err}`);
    }

}

export async function DeleteFolderApi(folderId:String) {
    try {
        const response = await fetch(`/api/folders?folderId=${folderId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Failed to delete folder");
        }

        return true;
    } catch (err) {
        throw new Error(`Error deleting folder: ${err}`);
    }
    
}