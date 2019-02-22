import express, { Router } from "express";
import FileService from "./FileService";
import path from "path";

export default class FileRouter {
    public router: Router;

    constructor(private fileService: FileService, routerOptions?: express.RouterOptions) {
        this.router = express.Router(routerOptions);
        
        this.router.get("/folders/:folderId", (req, res, next) => {
            fileService.getFolder(Number(req.params.folderId)).then((folder) => {
                res.send(folder);
            }).catch(next);
        });

        this.router.get("/:fileId", (req, res, next) => {
            fileService.getFile(Number(req.params.fileId)).then((file) => {
                res.send(file);
            }).catch(next);
        });

        this.router.get("/:fileId/download/:fileName", (req, res, next) => {
            fileService.getFile(Number(req.params.fileId)).then((file) => {
                res.sendFile(path.join(process.env.FILES_DIRECTORY, "uploaded", file.path));
            }).catch(next);
        });
    }
}