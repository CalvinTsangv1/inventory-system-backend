export enum AccessLogModule {
    PAYMENT = 'PAYMENT',
    REST = 'REST'
}

export enum AccessLogActivity {

}

export interface ApiLog {
    sub: string;
    accessToken?: string;
    service: string;
    activity: AccessLogActivity | string;
    module: AccessLogModule | string;
    description?: string;
}
export interface AccessLog extends ApiLog {
    accessToken?: string;
    ip?: string;
    hostName?: string;
    userAgent?: string;
}
