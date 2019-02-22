import Folder from "../entities/Folder";
import File from "../entities/File";
import { Repository } from "typeorm";
import path from "path";
import fs from "fs";

export default class FileFixtureManager {
    public files: File[];
    public folders: Folder[];
    
    constructor(private fileRepo: Repository<File>, private folderRepo: Repository<Folder>) {
        this.files = [];
        this.folders = [];
    }

    public async load(): Promise<void> {
        const subFolder = await this.folderRepo.save({
            name: "Sub Folder"
        });

        const filePath = path.join(process.env.FILES_DIRECTORY, "mockFileTest.txt");
        fs.writeFileSync(filePath, "This file is a test");
        const file = await this.fileRepo.save({
            name: "Mock File",
            path: filePath,
        });

        const topLevelFolder = await this.folderRepo.save({
            name: "Top Folder",
            subfolders: [subFolder],
            files: [file],
            owner: 1
        });

        this.folders = [topLevelFolder, subFolder];
        this.files = [file];
    }

    public async clear(): Promise<void> {
        this.files.map((file) => fs.unlinkSync(file.path));
        await this.folderRepo.delete({});
    }
}