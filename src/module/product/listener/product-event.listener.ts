import {Injectable, Logger} from "@nestjs/common";
import {ProductService} from "../service/product.service";
import {OnEvent} from "@nestjs/event-emitter";
import {ProductHistoryLogEntity} from "../entity/product-history-log.entity";
import {dataSource} from "../../../util/data-source";
import {ProductInventoryStatusEnum} from "../enum/product-inventory-status.enum";

@Injectable()
export class ProductEventListener {

    private readonly logger = new Logger(ProductEventListener.name);

    constructor(private readonly productService: ProductService) {
    }

    @OnEvent('product.imported', {async: true})
    async handleProductUpdatedEvent(product: ProductHistoryLogEntity) {
        product.type = ProductInventoryStatusEnum.IMPORTED
        await dataSource.manager.save(ProductHistoryLogEntity, product);
    }

    @OnEvent('product.exported', {async: true})
    async handleProductDeletedEvent(product: ProductHistoryLogEntity) {
        this.logger.log(`Product exported: ${JSON.stringify(product.product)}`)
        product.type = ProductInventoryStatusEnum.EXPORTED
        await dataSource.manager.save(ProductHistoryLogEntity, product);
    }
}