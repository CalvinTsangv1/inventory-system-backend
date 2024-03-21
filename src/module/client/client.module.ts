import {Global, Module} from "@nestjs/common";
import {ClientService} from "./service/client.service";
import {ClientController} from "./controller/client.controller";

@Global()
@Module({
  imports: [],
  providers: [ClientService],
  controllers: [ClientController],
  exports: [ClientService]
})

export class ClientModule {}
