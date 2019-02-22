import * as fs from "fs";
import * as path from "path";
import { Repository } from "typeorm";
import slugify from "slugify";

import FileService from "./FileService";
import Folder from "./entities/Folder";
import File from "./entities/File";
import mime from "mime";

export default class FileServiceImpl implements FileService {
    private fileRepo: Repository<File>;
    private folderRepo: Repository<Folder>;

    constructor(fileRepo: Repository<File>, folderRepo: Repository<Folder>) {
        this.fileRepo = fileRepo;
        this.folderRepo = folderRepo;
    }

    async getFile(fileId: number): Promise<File> {
        return this.fileRepo.findOneOrFail(fileId);
    }
    
    async getFolder(folderId: number): Promise<Folder> {
        return this.folderRepo.findOneOrFail(folderId, {relations: ["subfolders", "files"]});
    }

    async getFolderForOwner(owner: number): Promise<Folder> {
        return this.folderRepo.findOneOrFail({
            where: {owner},
            relations: ["subfolders", "files"]
        });
    }

    async createFolder(name: string, parentId?: number, owner?: number): Promise<Folder> {
        const newFolder = new Folder();
        newFolder.name = name;
        newFolder.files = [];
        newFolder.subfolders = [];

        if (parentId) {
            const parent = await this.folderRepo.findOneOrFail(parentId);
            newFolder.parent = Promise.resolve(parent);
        } else if (owner) {
            newFolder.owner = owner;
        } else {
            throw new Error("Need one of parent folder or role that owns top level folder");
        }

        return this.folderRepo.save(newFolder);
    }

    async uploadFile(name: string, tmpPath: string, mimeType: string, folderId: number, description?: string): Promise<File> {
        const file = new File();
        file.name = name;
        file.description = description;
        file.path = await this.moveFileFromTmp(name, tmpPath, mimeType);
        file.parent = Promise.resolve(await this.folderRepo.findOneOrFail(folderId));

        return this.fileRepo.save(file);
    }

    async moveFileFromTmp(name: string, tmpPath: string, mimeType: string): Promise<string> {
        const newName = [
            slugify(name),
            "-",
            (+new Date * Math.random()).toString(36).substr(2, 5),
            ".",
            mime.getExtension(mimeType)
        ].join("");
        const newPath = path.join(process.env.FILES_DIRECTORY, "uploaded", newName);

        return new Promise((resolve, reject) => {
            fs.rename(tmpPath, newPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(newName);
                }
            });
        });
    }

    async deleteFileOrFolder(fileOrFolder: "FOLDER" | "FILE", id: number): Promise<void> {
        if (fileOrFolder === "FOLDER") {
            await this.folderRepo.delete(id);
        } else if (fileOrFolder === "FILE") {
            await this.fileRepo.delete(id);
        }
    }   
}