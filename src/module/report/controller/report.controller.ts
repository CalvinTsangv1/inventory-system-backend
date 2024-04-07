import {Controller, Get, Logger, Param, Query} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {ReportService} from "../service/report.service";
import {CategoryTypeEnum} from "../../product/enum/category-type.enum";

@Controller("reports")
@ApiTags("reports")
export class ReportController {
  private readonly logger = new Logger(ReportController.name);

  constructor(private reportService: ReportService) {
  }

  @Get(":productId/product-daily-report")
  public async getProductDailyReport(@Param("productUd") productId: string) {
    return this.reportService.getAvailableProductDailyReport(productId);
  }

  @Get(":categoryId/category-daily-report")
  public async getCategoryDailyReport(@Param("categoryId") categoryId: string) {
    return this.reportService.getAvailableCategoryDailyReport(categoryId as CategoryTypeEnum);
  }
}