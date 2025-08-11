import { ApiProperty } from "@nestjs/swagger";
import { UserResponseData } from "../../../common/dto/user-response.dto";

export class GetAllUserResponse {
    @ApiProperty({
        description: 'User information',
        type: () => UserResponseData
    })
    user: UserResponseData;
}
