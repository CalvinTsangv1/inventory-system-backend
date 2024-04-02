import {Injectable, Logger} from "@nestjs/common";
import AWS from "aws-sdk";
import {ConfigService} from "@nestjs/config";
import {ProductService} from "../../product/service/product.service";
import moment from "moment-timezone";
import {dataSource} from "../../../util/data-source";
import {ReportEntity} from "../entity/report.entity";
import {ProductEntity} from "../../product/entity/product.entity";
import {Between} from "typeorm";
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

  private async getDailyReportGenerationTime() {
    return {
      today: moment().startOf('day').add(Number(this.dailyReportGenerationTime.split(":")[0]), 'hours').add(Number(this.dailyReportGenerationTime.split(":")[1]), 'minutes'),
      previousDay: moment().subtract(1, 'days').startOf('day').add(Number(this.dailyReportGenerationTime.split(":")[0]), 'hours').add(Number(this.dailyReportGenerationTime.split(":")[1]), 'minutes')
    };

  }

  private async getReport(fileName: string) {
    const {today, previousDay} = await this.getDailyReportGenerationTime();
    return dataSource.manager.findOne(ReportEntity, {where: {name: fileName, updatedAt: Between(today.toDate(), previousDay.toDate())}});

  }

  //** get daily report, only keep before next working day
  public async getAvailableProductDailyReport(productId: string) {
    if(this.dailyReportGenerationTime === null) {
      throw new Error("Daily report generation time is not set");
    }
    const fileName = `daily_report_${productId}.png`;
    const result = await this.getReport(fileName);

    /* if the report is not generated yet, generate it */
    if(!result?.mediaUrl) {
      const result = [await this.productService.getAvailableProductInventory(productId),
        await this.productService.getDeliveredProductInventory(productId),
        await this.productService.getConfirmedProductInventory(productId),
        await this.productService.getHoldingProductInventory(productId),
        await this.productService.getWaitingProductInventory(productId)]
      const mediaUrl = await this.generateBarChart(["Available", "Delivered", "Confirmed", "Holding", "Waiting"],
        "Daily Report: Total Inventory", result, fileName);
      const description = `🔎 Inventory for ${productId} : \n\nAvailable: ${result[0]} \nDelivered: ${result[1]} \nConfirmed: ${result[2]} \nHolding: ${result[3]} \nWaiting: ${result[4]}`

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
      const description = `🔎 Available Category Inventory: \n\n${categoryInventory.map((item, index) => `${index+1}. ${item.name} -- ${item.count}`).join("\n")}`

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
      const mediaUrl = await this.generateBarChart(["Waiting", "Holding", "Delivered", "Cancelled", "Available"],
        "Daily Report: Total Inventory",
        inventory, fileName);
      const description = `🔎 Available Inventory: \n\n${inventory.map((item, index) => `${index+1}. ${item}`).join("\n")}`

      await dataSource.manager.save(ReportEntity, {name: fileName, description: description, mediaUrl: mediaUrl});
      return {body: description, mediaUrl: mediaUrl}
    }

    return {body: result.description, mediaUrl: result.mediaUrl};
  }

  public async getAvailableCategoryTextReport(type: CategoryTypeEnum) {
    if(!Object.values(CategoryTypeEnum).includes(type)) {
      return "Category type not found, please type again! 🙈";
    }
    const categoryInventory = await this.productService.getAvailableCategoryInventory(type);
    const result = categoryInventory.map(item => `👉${item?.name} (Unit: ${item?.unit})\nCost: $${item?.cost}\nAvailable: ${item?.count}\n📝Description:\n${item?.description}\n`).join("\n");
    return `🔎 Available Inventory for ${type} Category: \n\n${result}`;
  }

  public async getAvailableProductTextReport(productId: string) {
    const item = await dataSource.manager.findOne(ProductEntity, {where: {id: productId}});
    if(!item?.name) { return "Product code not found, please type again! 🙈" }

    return `🔎 Inventory for ${item?.name} (code: ${productId}) : \n\nAvailable: ${await this.productService.getAvailableProductInventory(productId)} \nDelivered: ${await this.productService.getDeliveredProductInventory(productId)} \nHolding: ${await this.productService.getHoldingProductInventory(productId)} \n`;
  }

  public async getAvailableDailyTextReport() {
    return `🔎 Inventory for catalog : \n\nAvailable: ${await this.productService.getAvailableProductInventory()} \nDelivered: ${await this.productService.getDeliveredProductInventory()} \nHolding: ${await this.productService.getHoldingProductInventory()} \n`;
  }

  public async getOrderTextReport(orderId: string) {
    if(orderId === null || orderId === "") {
      return `Type order id to get the report! 🙈`
    }
    const result = await this.orderService.getOrderById(orderId)

    if(!result) {
      return `Order not found, please try again! 🙈`;
    }

    return `🔍 Your Order (ID: ${result.id}):\nCreate Date: ${result.createdAt.toDateString()}\n\n👉Client:\nName: ${result.client.contactName}\nPhone number:${result.client.phoneNumber}\n👉Status: ${result.status}\n👉Expected DeliveryDate:\n${result.expectedDeliveryDate.toDateString()}\n👉Expected Pickup Date:\n${result.expectedPickupDate.toDateString()}\n👉Product List:\n${result.orderProducts.map(item => `${item.product.id}: ${item.product.name} $${item.product.price} x ${item.quantity}`).join("\n")}\n`;
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