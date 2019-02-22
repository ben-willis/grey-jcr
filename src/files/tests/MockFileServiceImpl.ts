import FileService from "../FileService";
import Folder from "../entities/Folder";
import File from "../entities/File";

export default class MockFileServiceImp implements FileService {
    async getFile(fileId: number): Promise<File> {
        const file = new File();
        file.id = fileId;
        file.name = "Mock File";
        file.path = "/mock/patch";
        file.updated = new Date();

        return file;
    }

    async getFolder(folderId: number): Promise<Folder> {
        const folder = new Folder();
        folder.id = folderId;
        folder.name = "Mock Folder";
        folder.subfolders = [];
        folder.files = [];
        
        return folder;
    }

    async createFolder(name: string, parentId?: number, owner?: number): Promise<Folder> {
        throw new Error("Method not implemented.");
    }

    async uploadFile(name: string, tmpPath: string, folderId: number, description?: string): Promise<File> {
        throw new Error("Method not implemented.");
    }

    async deleteFileOrFolder(fileOrFolder: "FOLDER" | "FILE", id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
}