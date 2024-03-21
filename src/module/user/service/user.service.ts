import {forwardRef, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import admin, {app, firestore} from 'firebase-admin'
import {getFirestore} from 'firebase-admin/firestore'
import {UserInfoRequestDto} from "../dto/request/user-info.request.dto";
import {dataSource} from "../../../util/data-source";
import {UserEntity} from "../entity/user.entity";
import {Builder} from "builder-pattern";
import {RoleEnum} from "../../../enum/role.enum";
import Firestore = firestore.Firestore;


/*
* https://developer.paysafe.com/en/api-docs/payments-api/add-payment-methods/interac-e-transfer/
* process an Interac payment request
* 1. create payment handler (Post: paymenthub/v1/paymenthandles)
* 2. view the payment instructions on your hosted page
* 3. process the payment request via payments api by using paymentHandleToken (Post: paymenthub/v1/payments)
* 4. After the merchant process the payment using the Payments API
* */

@Injectable()
export class UserService {

  private logger = new Logger(UserService.name)
  private readonly fbApp: admin.app.App;
  private readonly firestoreDb: Firestore;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.fbApp = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(configService.get<string>("FB_CONFIG"))),
        databaseURL: 'https://foodie-order-7e63c.firebaseio.com'
      },
      'firebase'
    );
    //this.logger.log(`firebase app: ${JSON.stringify(this.fbApp)}`)
    this.firestoreDb = getFirestore(this.fbApp);

    this.baseUrl = `http:// + ${configService.get<string>("INVENTORY_SYSTEM_API_HOST")}`
  }


  public async getUserInfo(userId: string): Promise<UserInfoRequestDto> {
    let result;

    try {
      const query = await this.firestoreDb.collection('users').doc(userId);
      result = await query.get();
      this.logger.log(`result: ${JSON.stringify(result.data())}`)
    } catch (ex) {
      throw new InternalServerErrorException("Error in getting user from firebase")
    }

    if (!result.exists) {
      throw new NotFoundException("Firebase user not found");
    }

    this.logger.log(`Got user info by userId: ${userId}`);
    return result.data();
  }

  public async upsertUserInfo(dto: UserInfoRequestDto): Promise<any> {
    const query = this.firestoreDb.collection('users').doc(dto.id);
    //create customer in stripe
    await query.set({...dto});
    const result = await query.get();

    if(result.data) {
      await dataSource.manager.save(UserEntity, Builder<UserEntity>().id(dto.id).phoneNumber(dto.phoneNumber).role(RoleEnum.CUSTOMER).build())
    }
    return result.data();
  }

  public async deleteUserInfo(userId): Promise<any> {
    const query = this.firestoreDb.collection('users').doc(userId);
    const result = await query.delete();
    this.logger.log(`Deleted user info: ${userId}`);
    return result;
  }

}