import Folder from "../entities/Folder";
import File from "../entities/File";
import { Repository } from "typeorm";
import path from "path";
import fs from "fs";

export default class FileFixtureManager {
    public files: File[];
    public folders: Folder[];
    
    constructor(
        private fileRepo: Repository<File>,
        private folderRepo: Repository<Folder>,
    ) {
        this.files = [];
        this.folders = [];
    }

    public async load(validRoleIds: number[]): Promise<void> {
        if (validRoleIds.length === 0) {
            throw new Error("Must provide valid role IDs");
        }

        const subFolder = this.folderRepo.create({
            name: "Sub Folder"
        });

        const fileName = "mockfiletest-3123.txt";
        const filePath = path.join(process.env.FILES_DIRECTORY, "uploaded", fileName);
        fs.writeFileSync(filePath, "This file is a test");
        const file = await this.fileRepo.save({
            name: "Mock File",
            path: fileName,
        });

        const topLevelFolder = await this.folderRepo.save({
            name: "Top Folder",
            subfolders: [subFolder],
            files: [file],
            owner: validRoleIds[0]
        });

        subFolder.parent = Promise.resolve(topLevelFolder);
        await this.folderRepo.save(subFolder);

        this.folders = [topLevelFolder, subFolder];
        this.files = [file];
    }

    public async clear(): Promise<void> {
        this.files.map((file) => fs.unlinkSync(path.join(process.env.FILES_DIRECTORY, "uploaded", file.path)));
        await this.folderRepo.delete({});
        await this.fileRepo.delete({});
    }
}