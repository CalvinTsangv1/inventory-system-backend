import {Injectable, Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {dataSource} from "../../../util/data-source";
import {ProductEntity} from "../entity/product.entity";
import {getPaginatedResult} from "../../../util/pagination/pagination";
import {Between, FindOptionsWhere, In, Not} from "typeorm";
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

@Injectable()
export class ProductService {

  private logger = new Logger(ProductService.name)

  constructor(private readonly configService: ConfigService) {}


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

    this.logger.log(`products: ${JSON.stringify(products)}`)

    return await Promise.all(products?.docs?.map(async (product: ProductEntity) => {
      const totalOrderQuantity = await this.getTotalHoldingOrderQuantity(product.id);
      return {...product, totalHoldingQuantity: totalOrderQuantity}
    }))
  }

  private async getTotalOrderQuantity(productId: string) {
    const orderProducts = await dataSource.manager.find(OrderProductEntity, {where:{id: productId, order:{status: Not(OrderStatusEnum.DRAFT)}}});
    return orderProducts.reduce((total, orderProduct) => total + orderProduct.quantity, 0);
  }

  private async getTotalHoldingOrderQuantity(productId: string) {
    const orderProducts = await dataSource.manager.find(OrderProductEntity, {where:{id: productId, order:{status: In([OrderStatusEnum.HOLDING, OrderStatusEnum.CONFIRMED])}}});
    return orderProducts.reduce((total, orderProduct) => total + orderProduct.quantity, 0);
  }

  public async getProductById(id: string) {
    return dataSource.manager.findOne(ProductEntity, {where:{id:id}});
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

  public async updateProductStockQuantity(id: string, updateProductDto: UpdateProductRequestDto){
    const product = await this.getProductById(id);
    if(updateProductDto?.productName) product.name = updateProductDto.productName;
    if(updateProductDto?.productDescription) product.description = updateProductDto.productDescription;
    if(updateProductDto?.quantity) product.stockQuantity = updateProductDto.quantity;
    return dataSource.manager.save(product);
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

}