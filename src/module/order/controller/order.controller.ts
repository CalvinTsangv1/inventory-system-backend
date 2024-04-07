import {Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query} from "@nestjs/common";
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
import {OrderProductStatusEnum} from "../enum/order-product-status.enum";

@ApiBearerAuth()
@Controller("orders")
@ApiTags("orders")
export class OrderController {

  private readonly logger = new Logger(OrderController.name);

  constructor(private orderService: OrderService) {}

  @Get(':orderId/id')
  public async getOrderById(@Param('orderId')id: string) {
    return this.orderService.getOrderById(id);
  }

  @Get('')
  public async getOrderList(/*@CurrentUser() user: any, */@Query() dto: GetOrderListRequestDto) {
    this.logger.log(`get order list: ${JSON.stringify(dto)}`)
    return this.orderService.getOrderList(dto.userId, dto);
  }

  @Post()
  @ApiOperation({summary: 'Create order'})
  public async createOrder(/*@CurrentUser() user: any, */@Body() dto: CreateOrderRequestDto) {
    return this.orderService.createOrder(dto.userId, dto);
  }

  @Get('cronjob/update-completed-order')
  public async updateCompletedOrder() {
    return this.orderService.updateCompletedOrderStatus();
  }

  @Patch(':orderId/status')
  public async updateOrderStatus(@Param('orderId')id: string, @Body() dto: {orderProductId: string, status: OrderProductStatusEnum}) {
    this.logger.log(`id: ${id}`)
    this.logger.log(`update order status: ${JSON.stringify(dto)}`)
    return this.orderService.updateOrderStatus(id, dto);
  }

  @Patch(':orderId')
  public async updateOrderInfo(@Param('orderId')id: string, @Body() dto: UpdateOrderRequestDto) {
    return this.orderService.updateOrderInfo(id, dto);

  }

  @Delete(':orderId')
  public async cancelOrder(@Param("orderId") id: string) {
    return this.orderService.cancelOrder("sales",id);
  }

}
