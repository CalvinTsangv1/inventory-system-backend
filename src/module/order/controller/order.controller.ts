import {Controller, Delete, Get, Logger, Param, Patch, Post} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import {OrderStatusEnum} from "../enum/order-status.enum";
import {CreateOrderRequestDto} from "../dto/create-order.request.dto";
import {dataSource} from "../../../util/data-source";
import {ClientEntity} from "../../client/entity/client.entity";
import {OrderEntity} from "../entity/order.entity";
import {Builder} from "builder-pattern";
import {ProductEntity} from "../../product/entity/product.entity";
import {GetOrderListRequestDto} from "../dto/get-order-list.request.dto";
import {FindOptionsWhere} from "typeorm";
import {OrderService} from "../service/order.service";
import {UpdateOrderRequestDto} from "../dto/update-order.request.dto";
import {CurrentUser} from "../../../decorator/current-user.decorator";

@ApiBearerAuth()
@Controller("orders")
@ApiTags("orders")
export class OrderController {

  private readonly logger = new Logger(OrderController.name);

  constructor(private orderService: OrderService) {}

  @Get(':orderId')
  public async getOrderById(@Param('orderId')id: string) {
    return this.orderService.getOrderById(id);
  }

  @Post()
  @ApiOperation({summary: 'Create order'})
  public async createOrder(dto: CreateOrderRequestDto) {
    return this.orderService.createOrder(dto);
  }

  @Get('list')
  public async getOrderList(userId: string, dto: GetOrderListRequestDto) {
    return this.orderService.getOrderList(userId, dto);
  }

  @Get('cronjob/update-completed-order')
  public async updateCompletedOrder() {
    return this.orderService.updateCompletedOrderStatus();
  }

  @Patch(':orderId/status')
  public async updateOrderStatus(@Param('orderId')id: string, dto: {status: OrderStatusEnum}) {
    return this.orderService.updateOrderStatus(id, dto);
  }

  @Patch(':orderId')
  public async updateOrderInfo(@Param('orderId')id: string, dto: UpdateOrderRequestDto) {
    return this.orderService.updateOrderInfo(id, dto);

  }

  @Delete(':orderId')
  public async cancelOrder(@CurrentUser() user: any, id: string) {
    return this.orderService.cancelOrder("sales",id);
  }

}
