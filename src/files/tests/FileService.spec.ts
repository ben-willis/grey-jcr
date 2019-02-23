import { Connection, Repository, createConnection } from "typeorm";
import File from "../entities/File";
import Folder from "../entities/Folder";
import FileFixtureManager from "./FileFixtureManager";
import FileService from "../FileService";
import FileServiceImpl from "../FileServiceImpl";
import { expect } from "chai";
import path from "path";
import fs from "fs";

describe("File Service", () => {
    let connection: Connection;
    let fileRepo: Repository<File>;
    let folderRepo: Repository<Folder>;
    let fileFixtureManager: FileFixtureManager;
    let fileService: FileService;

    before(async () => {
        connection = await createConnection("grey");
        fileRepo = connection.getRepository(File);
        folderRepo = connection.getRepository(Folder);
        fileFixtureManager = new FileFixtureManager(fileRepo, folderRepo);
        fileService = new FileServiceImpl(fileRepo, folderRepo);
    });

    beforeEach(() => fileFixtureManager.load([1]));

    afterEach(() => fileFixtureManager.clear());

    after(() => connection.close());
    
    it("should create a new top level folder", () => {
        return fileService.createFolder("New Top Level", undefined, 2).then((folder) => {
            expect(folder.name).to.equal("New Top Level");
            return folder.parent;
        }).then((parent) => {
            expect(parent).to.be.undefined;
        });
    });

    it("should create a subfolder", () => {
        const parentFolder = fileFixtureManager.folders[0];
        return fileService.createFolder("New Sub Level", parentFolder.id).then((folder) => {
            expect(folder.name).to.equal("New Sub Level");
            return folder.parent;
        }).then((parent) => {
            expect(parent.name).to.equal(parentFolder.name);
        });
    });

    it("should add a new file", () => {
        const parentFolder = fileFixtureManager.folders[0];
        const testFileTmpPath = path.join(__dirname, "../../../tmp/testFile.txt");
        fs.writeFileSync(testFileTmpPath, "Test File");
        return fileService.uploadFile("Test File", testFileTmpPath, "text/plain", parentFolder.id).then((file) => {
            expect(file.name).to.equal("Test File");
            expect(fs.existsSync(path.join(process.env.FILES_DIRECTORY, "uploaded", file.path))).to.be.true;
            return file.parent;
        }).then((parent) => {
            expect(parent.name).to.equal(parentFolder.name);
        });
    });

    it("should get a file", () => {
        const fileToGet = fileFixtureManager.files[0];
        return fileService.getFile(fileToGet.id).then((file) => {
            expect(file.name).to.equal(fileToGet.name);
        });
    });

    it("should get a folder and all subfolders and files", () => {
        const folderToGet = fileFixtureManager.folders[0];
        return fileService.getFolder(folderToGet.id).then((folder) => {
            expect(folder.name).to.equal(folderToGet.name);
            expect(folder.subfolders).to.have.length(folderToGet.subfolders.length);
            expect(folder.files).to.have.length(folderToGet.files.length);
        });
    });

    it("should get a folder for an owner", () => {
        const folderToGet = fileFixtureManager.folders.filter(f => f.owner)[0];
        return fileService.getFolderForOwner(folderToGet.owner).then((folder) => {
            expect(folder.name).to.equal(folderToGet.name);
        });
    });

    it("should delete a folder", () => {
        const folderToDelete = fileFixtureManager.folders[0];
        return fileService.deleteFileOrFolder("FOLDER", folderToDelete.id).then(() => {
            return folderRepo.count({where: {id: folderToDelete.id}});
        }).then((count) => {
            expect(count).to.equal(0);
        });
    });

    it("should delete a file", () => {
        const fileToDelete = fileFixtureManager.files[0];
        return fileService.deleteFileOrFolder("FILE", fileToDelete.id).then(() => {
            return fileRepo.count({where: {id: fileToDelete.id}});
        }).then((count) => {
            expect(count).to.equal(0);
        });
    });
});