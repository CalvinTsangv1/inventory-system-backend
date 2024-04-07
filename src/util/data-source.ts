import { config } from "dotenv";
import { DataSource } from "typeorm";
import { Logger } from "@nestjs/common";
import { InternalServiceException } from "../module/rest/exception/internal-service.exception";
import {ProductEntity} from "../module/product/entity/product.entity";
import {UserEntity} from "../module/user/entity/user.entity";
import {ClientEntity} from "../module/client/entity/client.entity";
import {OrderEntity} from "../module/order/entity/order.entity";
import {OrderProductEntity} from "../module/order/entity/order-product.entity";
import {NotificationEntity} from "../module/notification/entity/notification.entity";
import {ReportEntity} from "../module/report/entity/report.entity";
import {ProductHistoryLogEntity} from "../module/product/entity/product-history-log.entity";

config(); // Load environment variables from .env
export const dataSource = new DataSource({
  type: "mysql",
  host: process.env.MYSQLDB_HOST || "localhost",
  port: Number(process.env.MYSQLDB_PORT) || 3306,
  username: process.env.MYSQLDB_USER || "user",
  password: process.env.MYSQLDB_PASSWORD || "password",
  database: process.env.MYSQLDB_NAME || "inventory",
  entities: [
    UserEntity,
    ClientEntity,
    ProductEntity,
    OrderEntity,
    OrderProductEntity,
    NotificationEntity,
    ReportEntity,
    ProductHistoryLogEntity
  ],
  synchronize: process.env.ENV === "dev", // auto create table if not exist but not recommended in production
});

export const initializeDataSource = async () => {
  const logger = new Logger("DataSource");
  return await dataSource.initialize()
    .then(() => logger.log("Database connection established"))
    .catch(e => {
      console.error(e);
      throw new InternalServiceException(`Database connection failed: ${e.message}`);
    });
}