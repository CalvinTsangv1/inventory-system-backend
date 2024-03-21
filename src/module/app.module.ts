import { Module } from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";
import {UserModule} from "./user/user.module";
import { ProductModule } from "./product/product.module";

@Module({
    imports:[
        /** load env config **/
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true
        }),
        JwtModule.register({}),
        UserModule,
        ProductModule
    ]
})

export class AppModule {
}
