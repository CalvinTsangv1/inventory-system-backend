import {Body, Controller, Get, Logger, Param, Patch, Post, Query} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import {ClientService} from "../service/client.service";
import {GetClientsRequestDto} from "../dto/get-clients.request.dto";
import {CurrentUser} from "../../../decorator/current-user.decorator";
import {CreateClientRequestDto} from "../dto/create-client.request.dto";
import {UpdateClientRequestDto} from "../dto/update-client.request.dto";
import {GetClientOrdersRequestDto} from "../dto/get-client-orders.request.dto";

@ApiBearerAuth()
@Controller("clients")
@ApiTags("clients")
export class ClientController {
  private readonly logger = new Logger(ClientController.name);

  constructor(private clientService: ClientService) {}

  @Get('list')
  @ApiOperation({summary: 'Get list of clients by user (sales / warehouse)'})
  public async getClients(/*@CurrentUser() user: any, */@Query() dto: GetClientsRequestDto) {
    return this.clientService.getClients(dto.userId, dto)
  }

  @Post()
  @ApiOperation({summary: 'Create client'})
  public async createClient(@Body() dto: CreateClientRequestDto) {
    return this.clientService.createClient(dto)
  }

  @Get('')
  @ApiOperation({summary: 'Get client details'})
  public async getClientDetailsById(@Query() dto: GetClientsRequestDto) {
    return this.clientService.getClientDetails(dto);
  }


  @Get(':clientId/orders')
  @ApiOperation({summary: 'Get client orders by id'})
  public async getClientOrders(@Param('clientId') id: string, @Query() dto: GetClientOrdersRequestDto) {
    return this.clientService.getClientOrders(id, dto);
  }

  @Patch(':clientId')
  @ApiOperation({summary: 'Update client details'})
  public async updateClient(@Param('clientId') id: string, @Body() dto: UpdateClientRequestDto) {
    return this.clientService.updateClient(id, dto)
  }

}