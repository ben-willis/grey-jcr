import fs from 'fs';
import util from "util";
import UserService from "./UserService";
import assert from "assert";
import path from 'path';
import Jimp from "jimp";

export default class UserServiceImpl implements UserService {
    async updateAvatar(username: string, file: Partial<Express.Multer.File>): Promise<string> {
        assert(file.mimetype.split('/')[0] === "image", "File is not an image");

        // Remove previous image
        const outputPath = path.join(process.env.FILES_DIRECTORY, 'avatars');
        const existingAvatars = await util.promisify(fs.readdir)(outputPath);
        await Promise.all(existingAvatars
            .filter(f => f.indexOf(username) > -1)
            .map(f => util.promisify(fs.unlink)(path.join(outputPath, f)))
        );
        
        // Compress and move image
        const outputFile = path.join(process.env.FILES_DIRECTORY, 'avatars', username + ".jpg");
        await Jimp.read(file.path).then(avatar => {
            return avatar
                .scaleToFit(600, 600)
                .quality(85)
                .write(outputFile)
        });
        return outputFile;
    }
}