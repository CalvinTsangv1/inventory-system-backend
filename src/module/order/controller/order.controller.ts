import {Controller, Logger} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";

@ApiBearerAuth()
@Controller("orders")
@ApiTags("orders")
export class OrderController {

  private readonly logger = new Logger(OrderController.name);

  constructor() {}

  public async createOrder({}) {

  }

  public async getOrderById({}) {

  }

  public async getOrderList({}) {

  }

  public async updateOrderStatus({}) {

  }

  public async updateOrderInfo({}) {

  }

  public async cancelOrder({}) {

  }

}
