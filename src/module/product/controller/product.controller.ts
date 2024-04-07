import {Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, SetMetadata} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import { ProductService } from "../service/product.service";
import {ProductEntity} from "../entity/product.entity";
import {UpdateProductRequestDto} from "../dto/product/update-product.request.dto";
import {CreateProductRequestDto} from "../dto/product/create-product.request.dto";
import { GetProductRequestDto } from "../dto/product/get-product.request.dto";
import {UpdateProductPriceRequestDto} from "../dto/product/update-product-price.request.dto";
import {GetProductOrderRequestDto} from "../dto/product/get-product-order.request.dto";
import {UpdateProductStockQuantityRequestDto} from "../dto/product/update-product-stock-quantity.request.dto";

const AllowUnauthorizedRequest = () => SetMetadata('allowUnauthorizedRequest', true);
@ApiBearerAuth()
@Controller('catalog')
@ApiTags('catalog')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private productService: ProductService) {
  }

  @AllowUnauthorizedRequest()
  @Get('')
  @ApiOperation({summary: 'Get catalog products'})
  public async getProducts(@Query() dto: GetProductRequestDto) {
    this.logger.log(`getProducts: ${JSON.stringify(dto)}`);
    return this.productService.getProducts(dto);
  }

  @Get(':productId')
  @ApiOperation({summary: 'Get catalog product by id'})
  public async getProductById(@Param('productId') id: string): Promise<ProductEntity> {
    return this.productService.getProductById(id);
  }

  @Get('orders/:productId')
  @ApiOperation({summary: 'Get catalog product order'})
  public async getProductOrder(@Param('productId') id: string, @Query() dto: GetProductOrderRequestDto) {
    return this.productService.getProductOrder(id, dto);
  }

  @Get('cronjob/update-product-purchase-quantity')
  @ApiOperation({summary: 'Update catalog product purchase quantity daily'})
  public async updateProductPurchaseQuantity() {
    return this.productService.updateProductPurchaseQuantity();
  }

  @AllowUnauthorizedRequest()
  @Post('')
  @ApiOperation({summary: 'Create catalog product'})
  public async createProduct(@Body() dto: CreateProductRequestDto) {
    return this.productService.createProduct(dto);
  }

  @AllowUnauthorizedRequest()
  @Post('bulk')
  @ApiOperation({summary: 'Create catalog product by batch'})
  public async createProducts(@Body() dto: CreateProductRequestDto[]) {
    return this.productService.createProducts(dto);
  }


  @Patch(':productId')
  @ApiOperation({summary: 'Update catalog product information'})
  public async updateProductInformationById(@Param('productId') id: string, @Body() updateProductDto: UpdateProductRequestDto) {
    return this.productService.updateProductInformationById(id, updateProductDto);
  }

  @Patch(':productIds')
  @ApiOperation({summary: 'Update catalog product information'})
  public async updateProductInformationByIds(@Param('productIds') ids: string[], @Body() updateProductDto: UpdateProductRequestDto) {
    return this.productService.updateProductInformationByIds(ids, updateProductDto);
  }

  @Patch('price/:productId')
  @ApiOperation({summary: 'Update catalog product price'})
  public async updateProductPrice(@Param('productId') id: string, @Body() updateProductPrice: UpdateProductPriceRequestDto) {
    return this.productService.updateProductPrice(id, updateProductPrice);
  }

  @Patch('stock-quantity/:productId')
  @ApiOperation({summary: 'Update catalog product stock quantity'})
  public async updateProductStockQuantity(@Param('productId') id: string, @Body() updateProductDto: UpdateProductStockQuantityRequestDto) {
    return this.productService.updateProductStockQuantity(id, updateProductDto);
  }

  @AllowUnauthorizedRequest()
  @Delete(':productId')
  @ApiOperation({summary: 'safe delete catalog product'})
  public async deleteProduct(@Param('productId') id: string) {
    return this.productService.deleteProduct(id);
  }

  @AllowUnauthorizedRequest()
  @Delete('all-products')
  @ApiOperation({summary: 'safe delete all products'})
  public async deleteAllProducts() {
    return this.productService.deleteAllProducts();
  }

}