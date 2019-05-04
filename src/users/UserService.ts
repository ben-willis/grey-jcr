export default interface UserService {
    updateAvatar(username: string, file: Partial<Express.Multer.File>): Promise<string>;
}