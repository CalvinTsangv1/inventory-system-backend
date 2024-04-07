import {Injectable, Logger} from "@nestjs/common";
import {GetClientsRequestDto} from "../dto/get-clients.request.dto";
import {Between, FindOptionsWhere, In} from "typeorm";
import {ClientEntity} from "../entity/client.entity";
import {Builder} from "builder-pattern";
import {PaginationInterface} from "../../../interface/pagination.interface";
import {getPaginatedResult} from "../../../util/pagination/pagination";
import {CreateClientRequestDto} from "../dto/create-client.request.dto";
import {UpdateClientRequestDto} from "../dto/update-client.request.dto";
import {dataSource} from "../../../util/data-source";
import {GetClientOrdersRequestDto} from "../dto/get-client-orders.request.dto";

@Injectable()
export class ClientService {

    private readonly logger = new Logger(ClientService.name);

    constructor() {
    }

    public async createClient(dto: CreateClientRequestDto) {
        if(!dto) throw new Error('Client data is required');

        const client = Builder<ClientEntity>()
          .contactName(dto?.clientName)
          .phoneNumber(dto?.phoneNumber)
          .address(dto?.address)
          .description(dto?.description)
          .userId(dto?.userId)
          .build();

        return dataSource.manager.save(ClientEntity,client);
    }

    public async updateClient(id: string, dto: UpdateClientRequestDto) {
        const client = await dataSource.manager.findOne(ClientEntity, {where: {id}});
        if(!client) throw new Error('Client not found');

        if(dto.contactName) client.contactName = dto.contactName;
        if(dto.phoneNumber) client.phoneNumber = dto.phoneNumber;
        if(dto.address) client.address = dto.address;
        if(dto.description) client.description = dto.description;

        return dataSource.manager.save(client);
    }

    public async getClientDetails(dto: GetClientsRequestDto) {
        const condition = {userId: dto.userId};

        if(dto.clientId) condition["id"] = dto.clientId;
        if(dto.phoneNumber) condition["phoneNumber"] = dto.phoneNumber;
        if(dto.contactName) condition["contactName"] = dto.contactName;

        return dataSource.manager.findOne(ClientEntity, {where: condition})
    }


    public async getClientOrders(id: string, dto: GetClientOrdersRequestDto) {
        const condition = {id: id};

        if(dto?.orderStatus) condition["orders"] = {status: In(dto.orderStatus)};
        if(dto?.orderIds) condition["orders"] = {id: In(dto?.orderIds)};
        if(dto?.orderStartDate && dto?.orderEndDate) condition["orders"] = {updatedAt: Between(dto.orderStartDate, dto.orderEndDate)};

        const options = Builder<PaginationInterface>()
          .pagination(dto.pagination)
          .page(dto.page)
          .limit(dto.limit)
          .sortBy(dto.sortBy)
          .sortOrder(dto.sortOrder)
          .build();
    }

    public async getClients(userId: string, dto: GetClientsRequestDto) {
        const condition: FindOptionsWhere<ClientEntity> = {userId: userId};

        if(dto?.clientId) condition.id = dto.clientId;
        if(dto?.phoneNumber) condition.phoneNumber = dto.phoneNumber;
        if(dto?.contactName) condition.contactName = dto.contactName;

        const options = Builder<PaginationInterface>()
          .pagination(dto.pagination)
          .page(dto.page)
          .limit(dto.limit)
          .sortBy(dto.sortBy)
          .sortOrder(dto.sortOrder)
          .build();

        this.logger.log(`get clients list: ${JSON.stringify(condition)}`);

        return getPaginatedResult(ClientEntity, condition, options, ['orders']);
    }
}