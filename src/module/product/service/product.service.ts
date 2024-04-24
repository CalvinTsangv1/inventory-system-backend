import {Injectable, Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {dataSource} from "../../../util/data-source";
import {ProductEntity} from "../entity/product.entity";
import {getPaginatedResult} from "../../../util/pagination/pagination";
import {Between, FindOptionsWhere, In, Like, Not} from "typeorm";
import {PaginationInterface} from "../../../interface/pagination.interface";
import {CreateProductRequestDto} from "../dto/product/create-product.request.dto";
import {Builder} from "builder-pattern";
import {UpdateProductRequestDto} from "../dto/product/update-product.request.dto";
import {GetProductRequestDto} from "../dto/product/get-product.request.dto";
import {UpdateProductPriceRequestDto} from "../dto/product/update-product-price.request.dto";
import {OrderStatusEnum} from "../../order/enum/order-status.enum";
import {GetProductOrderRequestDto} from "../dto/product/get-product-order.request.dto";
import {SortOrderEnum} from "../../../util/pagination/sort-order.enum";
import {OrderProductEntity} from "../../order/entity/order-product.entity";
import {CategoryTypeEnum} from "../enum/category-type.enum";
import {OrderProductStatusEnum} from "../../order/enum/order-product-status.enum";
import {EventEmitter2} from "@nestjs/event-emitter";
import {ProductHistoryLogEntity} from "../entity/product-history-log.entity";
import {ProductInventoryStatusEnum} from "../enum/product-inventory-status.enum";
import {UpdateProductStockQuantityRequestDto} from "../dto/product/update-product-stock-quantity.request.dto";

@Injectable()
export class ProductService {

  private logger = new Logger(ProductService.name)

  constructor(private readonly configService: ConfigService,
              public readonly eventEmitter: EventEmitter2) {}


  //** get product
  public async getProducts(dto: GetProductRequestDto) {
    const condition: FindOptionsWhere<ProductEntity> = {};
    const relation = []

    if(dto?.ids) condition.id = In(dto.ids);
    if(dto?.productName) condition.name = dto.productName;
    if(dto?.priceFrom && dto?.priceTo) {
      condition.price = Between(dto.priceFrom, dto.priceTo);
    }
    if(dto?.categoryType) condition.category = dto.categoryType;

    this.logger.log(`condition: ${JSON.stringify(condition)}`)
    const options = Builder<PaginationInterface>()
      .pagination(dto?.pagination)
      .page(dto?.page)
      .limit(dto?.limit)
      .sortBy(dto?.sortBy)
      .sortOrder(dto?.sortOrder)
      .build();

   // if(await dataSource.manager.exists(OrderProductEntity, {})) relation.push('orderProduct');

    let products = await getPaginatedResult(ProductEntity, condition, options, relation)

    return await Promise.all(products?.docs?.map(async (product: ProductEntity) => {
      const totalOrderQuantity = await this.getHoldingProductInventory(product.id);
      const totalOrderConfirmedQuantity = await this.getConfirmedProductInventory(product.id);
      return {...product, totalHoldingQuantity: totalOrderQuantity, totalConfirmedQuantity: totalOrderConfirmedQuantity}
    }))
  }

  public async getProductById(id: string) {
    return dataSource.manager.findOne(ProductEntity, {where:{id:id}}).then(async product => {
      const totalOrderQuantity = await this.getHoldingProductInventory(product.id);
      const totalOrderConfirmedQuantity = await this.getConfirmedProductInventory(product.id);
      return {...product, totalHoldingQuantity: totalOrderQuantity, totalConfirmedQuantity: totalOrderConfirmedQuantity}
    })
  }

  public async searchProductByName(name: string) {
    this.logger.log(`searching product by name: ${name}`)
    return dataSource.manager.find(ProductEntity, {where:{name: Like(`%${name}%`)}});
  }

  public async getProductOrder(id: string, dto: GetProductOrderRequestDto) {
    const condition: FindOptionsWhere<ProductEntity> = {id: id, orderProducts:{order:{status: Not(OrderStatusEnum.DRAFT)}}};

    if(!dto?.sortBy) dto.sortBy = 'createdAt';
    if(!dto?.sortOrder) dto.sortOrder = SortOrderEnum.DESC;

    const options = Builder<PaginationInterface>()
      .pagination(dto?.pagination?? true)
      .page(dto?.page?? 1)
      .limit(dto?.limit ?? 10)
      .sortBy(dto?.sortBy?? "updatedAt")
      .sortOrder(dto?.sortOrder ?? SortOrderEnum.DESC)
      .build();

    return getPaginatedResult(ProductEntity, condition, options, ['orders'])
  }

  public async getProductByIds(ids: string[]) {
    return dataSource.manager.findOne(ProductEntity, {where:{id: In(ids)}});
  }


  //** update product

  public async updateProductInformationById(id: string, updateProductDto: UpdateProductRequestDto){
    const product = await this.getProductById(id);
    if(updateProductDto?.productName) product.name = updateProductDto.productName;
    if(updateProductDto?.productDescription) product.description = updateProductDto.productDescription;
    if(updateProductDto?.quantity) product.stockQuantity = updateProductDto.quantity;
    return dataSource.manager.save(product);
  }

  public async updateProductInformationByIds(ids: string[], updateProductDto: UpdateProductRequestDto){
    const product = await this.getProductByIds(ids);
    if(updateProductDto?.productName) product.name = updateProductDto.productName;
    if(updateProductDto?.productDescription) product.description = updateProductDto.productDescription;
    if(updateProductDto?.quantity) product.stockQuantity = updateProductDto.quantity;
    return dataSource.manager.save(product);
  }

  public async updateStockQuantity(id: string, consumedQuantity: number){
    const product = await this.getProductById(id);
    product.stockQuantity = product.stockQuantity - consumedQuantity;
    return dataSource.manager.save(product);
  }


  public async updateProductPrice(id: string, updateProductDto: UpdateProductPriceRequestDto){
    const product = await this.getProductById(id);
    if(updateProductDto?.price) product.price = updateProductDto.price;
    return dataSource.manager.save(product);
  }

  public async updateProductStockQuantity(id: string, updateProductDto: UpdateProductStockQuantityRequestDto){
    const product = await this.getProductById(id);
    product.stockQuantity = product.stockQuantity + updateProductDto.quantity;

    this.eventEmitter.emit('product.imported', Builder<ProductHistoryLogEntity>().product(product).quantity(updateProductDto.quantity).build())
    await dataSource.manager.save(ProductEntity, product);

    //find waiting order and update status
    const waitingOrders = await dataSource.manager.find(OrderProductEntity, {where:{product: {id: id}, status: OrderProductStatusEnum.WAITING}, order: {createdAt: 'ASC'}});
    for(let i=0; i<waitingOrders.length; i++) {
      updateProductDto.quantity = updateProductDto.quantity - waitingOrders[i].quantity;
      if(updateProductDto.quantity <= 0) break;
      waitingOrders[i].status = OrderProductStatusEnum.HOLDING;
      await dataSource.manager.save(OrderProductEntity, waitingOrders[i]);
    }
  }

  //** create product
  public async createProduct(createProductDto: CreateProductRequestDto) {

    const product = Builder<ProductEntity>()
      .name(createProductDto.productName)
      .description(createProductDto.description)
      .category(createProductDto.categoryType)
      .price(createProductDto.price)
      .stockQuantity(createProductDto.quantity)
      .unit(createProductDto.unit)
      .photoUrl(createProductDto.photoUrl)
      .currency(createProductDto.currency).build();

    return dataSource.manager.save(ProductEntity, product);
  }

  public async createProducts(createProductDto: CreateProductRequestDto[]) {
    if(createProductDto.length === 0) throw new Error("No product to create")

    const products = []
    for(let i=0; i< createProductDto.length; i++) {
      products.push(
        Builder<ProductEntity>()
          .name(createProductDto[i].productName)
        .description(createProductDto[i].description)
        .category(createProductDto[i].categoryType)
        .price(createProductDto[i].price)
        .stockQuantity(createProductDto[i].quantity)
        .unit(createProductDto[i].unit)
        .photoUrl(createProductDto[i].photoUrl)
        .currency(createProductDto[i].currency).build());
    }

    return dataSource.manager.save(ProductEntity, products);
  }

  //** delete product

  public async deleteProduct(id: string) {
    const product = await this.getProductById(id);
    product.inactiveAt = new Date();
    return dataSource.manager.save(product);
  }

  public async deleteAllProducts() {
    return dataSource.manager.delete(ProductEntity, {})
  }

  public async softDeleteAllProducts() {
    return dataSource.manager.update(ProductEntity, {}, {inactiveAt: new Date()})
  }

  /** Get products batch by batch without any filter **/
  private async getProductsInBatch(page: number = 1, limit: number = 20) {
    return dataSource.manager.find(ProductEntity,  {skip: (page - 1) * limit, take: limit});
  }

  /** cronjob to update product purchase quantity daily **/
  public async updateProductPurchaseQuantity() {
    this.logger.log("Updating product purchase quantity...");
    let products =  await this.getProductsInBatch();
    let page = 1;
    while(products && products.length > 0) {
      products = await this.getProductsInBatch(page);
      for (const product of products) {
       // const purchaseQuantity = await this.getProductPurchaseQuantity(product.id);
        //await this.updateProductPurchaseQuantityById(product.id, purchaseQuantity);
      }
      page++;
    }
    this.logger.log("Updating product purchase quantity completed.");
  }


  public async getConfirmedProductInventory(productId?: string) {
    return await dataSource.manager.sum(OrderProductEntity, "quantity",{product: {id:productId}, status: In([OrderProductStatusEnum.CONFIRMED])}) ?? 0;
  }

  public async getHoldingProductInventory(productId?: string) {
    return await dataSource.manager.sum(OrderProductEntity, "quantity", {product: {id: productId}, status: OrderProductStatusEnum.HOLDING}) ?? 0;
  }

  public async getWaitingProductInventory(productId?: string) {
    return await dataSource.manager.sum(OrderProductEntity, "quantity", {product: {id: productId}, status: OrderProductStatusEnum.WAITING}) ?? 0;
  }

  public async getDeliveredProductInventory(productId?: string) {
    return await dataSource.manager.sum(OrderProductEntity, "quantity",{product: {id: productId}, status: In([OrderProductStatusEnum.DELIVERED, OrderProductStatusEnum.CONFIRMED])}) ?? 0;
  }

  public async getAvailableProductInventory(productId?: string) {
    const totalQuantity = await dataSource.manager.findOne(ProductEntity, {where: {id: productId}, select: ['stockQuantity']});

    this.logger.log(`product id: ${JSON.stringify(await dataSource.manager.find(OrderProductEntity, {where:{product: {id: productId}}}))}`)
    const occupiedQuantity = await dataSource.manager.sum(OrderProductEntity, "quantity", {product: {id: productId}, status: In([OrderProductStatusEnum.WAITING, OrderProductStatusEnum.HOLDING])}) ?? 0;

    return (totalQuantity.stockQuantity - occupiedQuantity) ?? 0;
  }

  public async getImportedProductInventory(productId?: string) {
    return await dataSource.manager.sum(ProductHistoryLogEntity, "quantity", {product: {id: productId}, type: ProductInventoryStatusEnum.IMPORTED, createdAt: Between(new Date(new Date().setHours(0,0,0,0)), new Date(new Date().setHours(23,59,59,999)))}) ?? 0;
  }

  public async getExportedProductInventory(productId?: string) {
    return await dataSource.manager.sum(ProductHistoryLogEntity, "quantity", {product: {id: productId}, type: ProductInventoryStatusEnum.EXPORTED, createdAt: Between(new Date(new Date().setHours(0,0,0,0)), new Date(new Date().setHours(23,59,59,999)))}) ?? 0;
  }

  public async isExistProduct(productId: string) {
    return dataSource.manager.exists(ProductEntity, {where:{id: productId}});
  }

  public async getAvailableCategoryInventory(type: CategoryTypeEnum): Promise<any> {
    const catalog = await dataSource.manager.find(ProductEntity, {where: {category: type}});
    const inventory = []
    for(let i=0; i<catalog.length; i++) {
      inventory.push({name: catalog[i].name, count: await this.getAvailableProductInventory(catalog[i].id), unit: catalog[i].unit, cost: catalog[i].price, description: catalog[i].description ?? 0})
    }
    return inventory;
  }

  public async getAllInventory() {
    const result = []
    result.push(await dataSource.manager.sum(ProductHistoryLogEntity, "quantity", {type: ProductInventoryStatusEnum.IMPORTED, createdAt: Between(new Date(new Date().setHours(0,0,0,0)), new Date(new Date().setHours(23,59,59,999)))}) ?? 0)
    result.push(await dataSource.manager.sum(ProductHistoryLogEntity, "quantity", {type: ProductInventoryStatusEnum.EXPORTED, createdAt: Between(new Date(new Date().setHours(0,0,0,0)), new Date(new Date().setHours(23,59,59,999)))}) ?? 0)
    const availableStock = await dataSource.manager.sum(ProductEntity, "stockQuantity", {})-result[2]-result[1];
    result.push(availableStock > 0 ? availableStock : 0)
    result.push(await dataSource.manager.sum(OrderProductEntity, "quantity", {status: OrderProductStatusEnum.WAITING}) ?? 0)
    result.push(await dataSource.manager.sum(OrderProductEntity, "quantity", {status: OrderProductStatusEnum.HOLDING}) ?? 0)
    result.push(await dataSource.manager.sum(OrderProductEntity, "quantity", {status:In([OrderProductStatusEnum.CONFIRMED, OrderProductStatusEnum.DELIVERED])}) ?? 0)
    result.push(await dataSource.manager.sum(OrderProductEntity, "quantity", {status: OrderProductStatusEnum.CANCELLED}) ?? 0)
    return result;
  }

}