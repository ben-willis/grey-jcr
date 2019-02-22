import express, { Router } from "express";
import FileService from "./FileService";

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

        this.router.get("/:fileId/download", (req, res, next) => {
            fileService.getFile(Number(req.params.fileId)).then((file) => {
                res.sendFile(file.path);
            }).catch(next);
        });
    }
}