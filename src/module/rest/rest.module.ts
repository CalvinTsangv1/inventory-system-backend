import { Module } from '@nestjs/common';
import { RestService } from './service/rest.service';
import { ConfigModule } from '@nestjs/config';
import { HttpConfigService } from '../config/http.config.service';
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [ConfigModule, HttpModule.registerAsync({
        imports: [ConfigModule],
        useClass: HttpConfigService
    })],
    providers: [RestService],
    exports: [RestService],
})
export class RestModule {

}
