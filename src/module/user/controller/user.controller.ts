import {Body, Controller, Delete, Get, Logger, Param, Patch, Post} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import { UserService } from "../service/user.service";
import {CurrentUser} from "../../../decorator/current-user.decorator";
import {UserInfoRequestDto} from "../dto/request/user-info.request.dto";

@ApiBearerAuth()
@Controller('users')
@ApiTags('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {
  }

  @Get(":userId")
  @ApiOperation({ summary: "Get user info by user id" })
  public async getUserInfo (@Param("userId") userId: string): Promise<any> {
    return this.userService.getUserInfo(userId);
  }

  @Post()
  @ApiOperation({ summary: "Upsert user info" })
  public async upsertUserInfo (@Body() dto: UserInfoRequestDto): Promise<any> {
    return this.userService.upsertUserInfo(dto);
  }

  @Delete()
  @ApiOperation({ summary: "Delete user info by user id" })
  public async deleteUserInfo (@CurrentUser() userId: string): Promise<any> {
    return this.userService.deleteUserInfo(userId);
  }

}