import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpModuleOptions, HttpModuleOptionsFactory } from "@nestjs/axios";


@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  constructor(
    private configService: ConfigService 
  ) { }

  createHttpOptions(): HttpModuleOptions {
    return {}
  }
}
