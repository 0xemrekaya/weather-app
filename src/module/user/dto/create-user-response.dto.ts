import { ApiProperty } from "@nestjs/swagger";
import { UserResponseData } from "../../../common/dto/user-response.dto";

export class CreateUserResponse {
    @ApiProperty({
        description: 'User information',
        type: () => UserResponseData
    })
    user: UserResponseData;
}
