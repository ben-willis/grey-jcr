import path from 'path';
import UserServiceImpl from "../UserServiceImpl";
import UserService from "../UserService";
import { expect } from 'chai';

describe("User Service", () => {
    let userService: UserService;

    before(() => {
        userService = new UserServiceImpl();
    });

    it("should update a users avatar", () => {
        const testFile: Partial<Express.Multer.File> = {
            mimetype: "image/jpeg",
            path: path.join(__dirname, "files", "au1qeKZzjAIRWFI5MNBeMqXGQ2uV7OP7IZtFu33Y")
        }
        return userService.updateAvatar("aaaa11", testFile).then(output => {
            expect(output).to.not.be.undefined;
        });
    });

    it("should not update a users avatar if file is not an image", () => {
        const testFile: Partial<Express.Multer.File> = {
            mimetype: "text/plain",
            path: path.join(__dirname, "files", "notanimage.txt")
        }
        return userService.updateAvatar("aaaa11", testFile).catch(err => {
            expect(err.message).to.equal("File is not an image");
        });
    });
});