import { Controller, Delete, Post } from '@nestjs/common';


@Controller('storage')
export class StorageController {

    @Post('pfp')
    async updateProfilePicture() {

    }
    @Delete('pfp')
    async removeProfilePicture() {

    }


}
