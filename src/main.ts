import {NestFactory, Reflector} from '@nestjs/core';
import { json } from 'express';
import dotenv from 'dotenv';
import { AppModule } from './module/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ChannelInterceptor } from './interceptor/channel.interceptor';
import rTracer from 'cls-rtracer';
import { initializeDataSource } from "./util/data-source";
import {AllExceptionFilter} from "./filter/all-exception.filter";
import {ConfigService} from "@nestjs/config";
import {AuthorizationGuard} from "./guard/authorization.guard";
import {RolesGuard} from "./guard/roles.guard";
import {JwtService} from "@nestjs/jwt";

async function bootstrap() {
    dotenv.config();

    /** create app **/
    const app = await NestFactory.create(AppModule, { cors: true });
    const reflector = app.get(Reflector)
    const configService = app.get<ConfigService>(ConfigService)
    const jwtService = app.get<JwtService>(JwtService)

    /** setup service configuration **/
    const servicePort = configService.get<string>('AIRCITY_PROCESS_API_PORT') || 2001;
    const serviceName = configService.get<string>('AIRCITY_PROCESS_API_NAME') || 'aircity-process-api';
    const serviceVersion = configService.get<string>('NPM_PACKAGE_VERSION') || "1.0";


    /** initialize datasource **/
    await initializeDataSource();

    /** build swagger ui **/
    const options = new DocumentBuilder().addBearerAuth().setTitle(serviceName).setVersion(serviceVersion).build();
    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, options));

    /** setup global validation pipe **/
    app.useGlobalPipes(new ValidationPipe({ transform: true, forbidUnknownValues: false }));
    app.useGlobalFilters(new AllExceptionFilter());
    app.useGlobalGuards(new AuthorizationGuard(reflector, jwtService), new RolesGuard(reflector))

    /** use express middleware **/
    app.use(json({ limit: '120mb' }));
    app.use(rTracer.expressMiddleware({ useHeader: true, echoHeader: true }));

    /** setup global interceptor **/
    app.useGlobalInterceptors(new ChannelInterceptor());

    /** init app **/
    app.listen(servicePort, () => {
        console.log(`Application ${serviceName}: ${serviceVersion} is listening on port ${servicePort}`);
    });
}

bootstrap();
