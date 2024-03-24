import {Injectable, Logger} from "@nestjs/common";
import {CreateOrderRequestDto} from "../dto/create-order.request.dto";
import {dataSource} from "../../../util/data-source";
import {ClientEntity} from "../../client/entity/client.entity";
import {Builder} from "builder-pattern";
import {OrderEntity} from "../entity/order.entity";
import {OrderStatusEnum} from "../enum/order-status.enum";
import {GetOrderListRequestDto} from "../dto/get-order-list.request.dto";
import {Between, FindOptionsWhere, In, LessThan} from "typeorm";
import {getPaginatedResult} from "../../../util/pagination/pagination";
import {PaginationInterface} from "../../../interface/pagination.interface";
import {UpdateOrderRequestDto} from "../dto/update-order.request.dto";
import {OrderProductEntity} from "../entity/order-product.entity";
import moment from "moment-timezone";
import {SortOrderEnum} from "../../../util/pagination/sort-order.enum";
import {ProductEntity} from "../../product/entity/product.entity";

@Injectable()
export class OrderService {

  private readonly logger = new Logger(OrderService.name);

  constructor() {
  }

  public async getOrderById(id: string) {
    if(!id) {
      throw new Error("Order ID is required");
    }
    return dataSource.manager.findOne(OrderEntity, {where: {id}});
  }

  public async getOrderList(userId: string, dto: GetOrderListRequestDto) {
    const condition: FindOptionsWhere<OrderEntity> = {userId: userId};

    if(dto?.clientIds) {
      condition.client = {id: In(dto.clientIds)};
    }

    if(dto?.productIds) {
      condition.orderProducts = {product: {id:In(dto.productIds)}};
    }

    if(dto?.status) {
      condition.status = dto.status;
    }

    if(dto?.startPeriodPickupDate && dto?.endPeriodPickupDate) {
      condition.expectedPickupDate = Between(dto.startPeriodPickupDate, dto.endPeriodPickupDate);
    }

    const options = Builder<PaginationInterface>()
      .pagination(dto?.pagination?? true)
      .page(dto?.page?? 1)
      .limit(dto?.limit ?? 10)
      .sortBy(dto?.sortBy?? "updatedAt")
      .sortOrder(dto?.sortOrder ?? SortOrderEnum.DESC)
      .build();

    this.logger.log(`get order list: ${JSON.stringify(condition)}`)

    return getPaginatedResult(OrderEntity, condition, options, ["client", "orderProducts"])
  }

  public async updateCompletedOrderStatus() {
    return dataSource.manager.find(OrderEntity, {where: {status: OrderStatusEnum.DELIVERED, updatedAt: LessThan(moment().subtract(7,'days').toDate())}}).then(orders => {
      orders.forEach(order => {
        if(order.expectedDeliveryDate && new Date(order.expectedDeliveryDate) < new Date()) {
          order.status = OrderStatusEnum.COMPLETED;
          dataSource.manager.save(order);
        }
      })
    })
  }

  public async updateOrderStatus(id: string, dto: {status: OrderStatusEnum}) {
    return dataSource.manager.findOne(OrderEntity, {where: {id}}).then(order => {
      if(!order) {
        throw new Error("Order not found");
      }
      order.status = dto.status;
      return dataSource.manager.save(order);
    })
  }

  public async createOrder(userId: string, dto: CreateOrderRequestDto) {
    if(dto?.orderProducts.length === 0) {
      throw new Error("order products cannot be empty");
    }

    if(!dto?.clientId) {
      throw new Error("Client ID is required");
    }

    const client = await dataSource.manager.findOne(ClientEntity, {where: {id: dto.clientId}}).then(client => {
      if(!client) {
        throw new Error("Client not found");
      }
      return client;
    });

    // Create order
    const products = []

    for(let i=0; i<dto.orderProducts.length; i++) {
      let product = await dataSource.manager.findOne(ProductEntity, {where: {id:dto.orderProducts[i].productId}})
      let orderProduct= await dataSource.manager.save(OrderProductEntity, Builder<OrderProductEntity>()
        .product(product)
        .price(dto.orderProducts[i].price)
        .quantity(dto.orderProducts[i].quantity)
        .total(dto.orderProducts[i].total).build())
      products.push(orderProduct)
    }
    const newOrder = Builder<OrderEntity>().orderProducts(products).userId(userId)
      .note(dto.note)
      .client(client)
      .status(OrderStatusEnum.DRAFT)
      .build();

    if(dto?.expectedDeliveryDate || dto?.expectedPickupDate) {
      newOrder.status = OrderStatusEnum.HOLDING;
      newOrder.expectedDeliveryDate = dto?.expectedDeliveryDate;
      newOrder.expectedPickupDate = dto?.expectedPickupDate;
    }
    this.logger.log(`create order: ${JSON.stringify(newOrder)}`)
    return dataSource.manager.save(OrderEntity, newOrder);
  }

  public async cancelOrder(role: string, id: string) {
    return dataSource.manager.findOne(OrderEntity, {where: {id}}).then(order => {
      if(!order) {
        throw new Error("Order not found");
      }

      //sales order can only be cancelled if it is in draft or holding status
      if(order.status === OrderStatusEnum.DRAFT || order.status === OrderStatusEnum.HOLDING) {
        order.status = OrderStatusEnum.CANCELLED;
      }

      //warehouse order can only be cancelled if it is in confirmed status
      if(order.status === OrderStatusEnum.CONFIRMED && role === "warehouse") {
        order.status = OrderStatusEnum.CANCELLED;
      }
      return dataSource.manager.save(order);
    })
  }

  public async updateOrderInfo(id: string, dto: UpdateOrderRequestDto) {
    if(dto?.orderProducts) {
      for(let i=0; i<dto.orderProducts.length; i++) {
        if (!dto.orderProducts[i].id) {
          dto.orderProducts[i] = await dataSource.manager.save(OrderProductEntity, dto.orderProducts[i])
        } else {
          await dataSource.manager.update(OrderProductEntity, {id: dto.orderProducts[i].id}, dto.orderProducts[i])
         }
      }
    }

    return dataSource.manager.findOne(OrderEntity, {where: {id}}).then(order => {
      if(!order) {
        throw new Error("Order not found");
      }
      if(dto?.orderProducts) order.orderProducts = dto.orderProducts as any;
      if(dto?.note) order.note = dto.note;
      if(dto?.expectedDeliveryDate) order.expectedDeliveryDate = dto.expectedDeliveryDate;
      if(dto?.expectedPickupDate) order.expectedPickupDate = dto.expectedPickupDate;
      return dataSource.manager.save(order);
    })
  }
}
