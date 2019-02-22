import Folder from "./entities/Folder";
import File from "./entities/File";

export default interface FileService { 
    getFile(fileId: number): Promise<File>;
    getFolder(folderId: number): Promise<Folder>;
    getFolderForOwner(owner: number): Promise<Folder>;
    createFolder(name: string, parentId?: number, owner?: number): Promise<Folder>;
    uploadFile(name: string, tmpPath: string, mimeType: string, folderId: number, description?: string): Promise<File>;
    deleteFileOrFolder(fileOrFolder: "FOLDER"|"FILE", id: number): Promise<void>;
}