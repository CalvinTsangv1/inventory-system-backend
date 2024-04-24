import {Injectable, Logger} from "@nestjs/common";
import AWS from "aws-sdk";
import {ConfigService} from "@nestjs/config";
import {ProductService} from "../../product/service/product.service";
import moment from "moment-timezone";
import {dataSource} from "../../../util/data-source";
import {ReportEntity} from "../entity/report.entity";
import {ProductEntity} from "../../product/entity/product.entity";
import {And, Between, MoreThanOrEqual} from "typeorm";
import {CategoryTypeEnum} from "../../product/enum/category-type.enum";
import {OrderService} from "../../order/service/order.service";

@Injectable()
export class ReportService {

  private readonly s3Client: any;
  private readonly bucketName: string;
  private readonly dailyReportGenerationTime: string;
  private readonly logger: Logger = new Logger(ReportService.name);

  constructor(private configService: ConfigService,
              private productService: ProductService,
              private orderService: OrderService) {
    const awsConfig = JSON.parse(this.configService.get<string>("AWS_KEY"));
    this.s3Client = new AWS.S3(awsConfig);
    this.bucketName = this.configService.get<string>("AWS_BUCKET_NAME");
    this.dailyReportGenerationTime = this.configService.get<string>("DAILY_REPORT_GENERATION_TIME");
  }


  private async getReport(fileName: string) {
    const today = moment().startOf('day').add(Number(this.dailyReportGenerationTime.split(":")[0]), 'hours').add(Number(this.dailyReportGenerationTime.split(":")[1]), 'minutes')
    this.logger.log(`report: ${JSON.stringify(await dataSource.manager.findOne(ReportEntity, {where: {name: fileName}}))}`)
    return dataSource.manager.findOne(ReportEntity, {where: {name: fileName, updatedAt: MoreThanOrEqual(today.toDate())}});

  }

  //** get daily report, only keep before next working day
  public async getAvailableProductDailyReport(productId: string) {
    if(this.dailyReportGenerationTime === null) {
      throw new Error("Daily report generation time is not set");
    }
    const product = await this.productService.getProductById(productId);
    if(!product) {
      return {body:"🔍 產品編號未找到，請再試一次！🙈"};
    }
    const fileName = `daily_report_${productId}.png`;
    const result = await this.getReport(fileName);

    /* if the report is not generated yet, generate it */
    if(!result?.mediaUrl) {
      const result = [
        await this.productService.getImportedProductInventory(productId),
        await this.productService.getExportedProductInventory(productId),
        await this.productService.getAvailableProductInventory(productId),
        await this.productService.getDeliveredProductInventory(productId),
        await this.productService.getHoldingProductInventory(productId),
        await this.productService.getWaitingProductInventory(productId)]
      const mediaUrl = await this.generateBarChart(["Imported", "Exported", "Available", "Delivered", "Confirmed", "Holding", "Waiting"],
        "Daily Report: Total Inventory", result, fileName);
      const description = `🔎 ${product.name}產品庫存 (編號: ${productId}) (${product.unit}): \n\n進口數量：${result[0]} \n出口數量：${result[1]} \n可用數量：${result[2]} \n已交付數量：${result[3]} \n持有數量： ${result[4]} \n等待數量：${result[5]}`

      await dataSource.manager.save(ReportEntity, {name: fileName, description: description, mediaUrl: mediaUrl});
      return {body: description, mediaUrl: mediaUrl}
    }

    return {body: result.description, mediaUrl: result.mediaUrl};
  }


  public async getAvailableCategoryDailyReport(type: CategoryTypeEnum) {

    const fileName = `daily_report_${type}.png`;
    const result = await this.getReport(fileName);

    /* if the report is not generated yet, generate it */
    if(!result?.mediaUrl) {

      const categoryInventory = await this.productService.getAvailableCategoryInventory(type);
      const mediaUrl = await this.generateBarChart(categoryInventory.map(item => item.name),
        "Daily Report: Total Category Inventory",
        categoryInventory.map(item => item.count), fileName);
      const description = `🔎  可用種類庫存： \n\n${categoryInventory.map((item, index) => `${index+1}. ${item.name} -- ${item.count}`).join("\n")}`

      await dataSource.manager.save(ReportEntity, {name: fileName, description: description, mediaUrl: mediaUrl});
      return {body: description, mediaUrl: mediaUrl}
    }

    return {body: result.description, mediaUrl: result.mediaUrl};
  }

  public async getAvailableDailyReport() {
    const fileName = `daily_report.png`;
    const result = await this.getReport(fileName);

    if(!result?.mediaUrl) {

      const inventory = await this.productService.getAllInventory();
      const mediaUrl = await this.generateBarChart(["Imported", "Exported", "Available", "Waiting", "Holding", "Delivered", "Cancelled"],
        "Daily Report: Total Inventory",
        inventory, fileName);
      const description = `🔎 Daily Inventory: \n\nPurchases: ${inventory[0]} \nSales: ${inventory[1]} \nInventory: ${inventory[2]} \nPending: ${inventory[3]} \nHeld but undelivered: ${inventory[4]} \nDelivered: ${inventory[5]} \nCancelled: ${inventory[6]}`

      await dataSource.manager.save(ReportEntity, {name: fileName, description: description, mediaUrl: mediaUrl});
      return {body: description, mediaUrl: mediaUrl}
    }

    return {body: result.description, mediaUrl: result.mediaUrl};
  }

  public async getAvailableCategoryTextReport(type: CategoryTypeEnum) {
    if(!Object.values(CategoryTypeEnum).includes(type)) {
      return "Category not found, please re-enter! 🙈\nCategory options: \n1: FISH \n2: MOLLUSK \n3: SEAWEED \n4: CRUSTACEAN";
    }
    const categoryInventory = await this.productService.getAvailableCategoryInventory(type);
    const result = categoryInventory.map(item => `👉${item?.name} (Unit: ${item?.unit})\nCost: $${item?.cost}\nInventory Quantity: ${item?.count}\n📝Description:\n${item?.description}\n`).join("\n");
    return `🔎 ${type} Inventory Status of Categories: \n\n${result}`;
  }

  public async getAvailableProductTextReport(productId: string) {
    const item = await dataSource.manager.findOne(ProductEntity, {where: {id: productId}});
    if(!item?.name) { return "Product code not found, please re-enter! 🙈" }

    return `🔎 Inventory of ${item?.name} (Code: ${productId}) : \n\nAvailable Inventory: ${await this.productService.getAvailableProductInventory(productId)} \nDelivered Inventory: ${await this.productService.getDeliveredProductInventory(productId)} \nHolding Inventory: ${await this.productService.getHoldingProductInventory(productId)} \n`;
  }

  public async getAvailableDailyTextReport() {
    return `🔎 Inventory for catalog : \n\nAvailable: ${await this.productService.getAvailableProductInventory()} \nDelivered: ${await this.productService.getDeliveredProductInventory()} \nHolding: ${await this.productService.getHoldingProductInventory()} \n`;
  }

  public async getOrderTextReport(orderId: string) {
    if(orderId === null || orderId === "") {
      return `Please input the order number to retrieve the report! 🙈`
    }
    const result = await this.orderService.getOrderById(orderId)

    if(!result) {
      return `Order not found, please try again! 🙈`;
    }

    return `🔍 您的訂單 (ID: ${result.id}) ：\n建立日期: ${result.createdAt.toDateString()}\n\n👉 客戶:\n姓名: ${result.client.contactName}\n電話號碼: ${result.client.phoneNumber}\n\n👉 狀態: ${result.status}\n👉 預計交貨日期:\n${result.expectedDeliveryDate.toDateString()}\n👉 預計取貨日期:\n${result.expectedPickupDate.toDateString()}\n👉 產品清單:\n${result.orderProducts.map(item => `(編號${item.product.id}): ${item.product.name}  $${item.product.price} x ${item.quantity}`).join("\n")}\n`;
  }

  public async generateBarChart(labelValues: string[], labelName: string, resultData: number[], fileName: string): Promise<string> {

    const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

    // Chart configuration
    const width = 800; // Width of the chart
    const height = 600; // Height of the chart

    // Data for the bar chart
    const data = {
      labels: labelValues,
      datasets: [{
        label: labelName,
        data: resultData,
        backgroundColor: 'rgba(54, 162, 235, 0.5)', // Bar color
        borderColor: 'rgba(54, 162, 235, 1)', // Border color
        borderWidth: 1
      }]
    };

    // Chart configuration
    const options = {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    };

    const canvasRenderService = new ChartJSNodeCanvas({width, height});
    const image = await canvasRenderService.renderToBuffer({
      type: 'bar',
      data: data,
      options: options
    });

    return await this.uploadFileToS3(image, fileName)
  }

  public async uploadFileToS3(imageBuffer: any, fileName: string) {
    const params = { Bucket: this.bucketName, Key: fileName, Body: imageBuffer, ContentType: 'image/png', ACL: 'public-read' };
    const { Location } = await this.s3Client.upload(params).promise();
    return Location;
  }

  public async getFileFromS3(fileName: string) {
    const params = {
      Bucket: this.bucketName,
      Key: fileName
    };
    const { Body } = await this.s3Client.getObject(params).promise();
    this.logger.log(`file: ${Body}`)
    return Body;
  }

}