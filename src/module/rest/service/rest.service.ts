import { Observable } from 'rxjs';
import { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse, RawAxiosRequestHeaders } from 'axios';
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { RequestContext } from "nestjs-request-context";
import rTracer from 'cls-rtracer';

/**
 * A custom http service responsible for adding authorization header coming from express to microservice
 */

@Injectable()
export class RestService {
    private readonly logger = new Logger(RestService.name);

    constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService
    ) {
        this.axiosRef.interceptors.request.use((config) => {
            const request = RequestContext.currentContext?.req;
            const configHeaders = { ...config.headers };
            const requestHeaders = { ...request.headers as AxiosRequestHeaders };

            //filter request headers
            const acceptHeaders = (configService.get("ACCEPT_HEADERS") || '').toLowerCase().split(',');
            Object.keys(requestHeaders).forEach((key) => {
                if (!acceptHeaders.includes(key.toLowerCase())) {
                    delete requestHeaders[key]
                }
            });

            const headers: RawAxiosRequestHeaders = {
                ...configHeaders,
                ...requestHeaders
            };

            const needRemoveHeaders = ['content-length', 'accept'];

            Object.keys(headers).forEach((key) => {
                if (needRemoveHeaders.includes(key.toLowerCase())) {
                    delete headers[key]
                }
            });

            //@ts-ignore
            config.headers = { ...headers };

            // x-request-id
            config.headers['X-Request-Id'] = rTracer.id() as string ?? ''

            /*
            if (this.configService.get<string>('ENABLE_CHANNEL') === 'true') {
                // depand on authorization guard, to save user data into contextService
                const token: string = request?.headers && request?.headers['authorization']
                if (token && token.startsWith('Bearer ')) {
                    const jwtService = new JwtService({})
                    const jwt = request.headers['authorization'].replace('Bearer ', '')
                    const jwtUser = <JwtModel>jwtService.decode(jwt);

                    if (jwtUser) {
                        config.headers['X-Pruforce-Channel'] = `region=${jwtUser.region};channel=${jwtUser.channel}`
                    }
                }
            }
            */

            return config;
        });
    }

    get axiosRef(): AxiosInstance {
        return this.httpService.axiosRef;
    }

    request<T = any>(config: AxiosRequestConfig): Observable<AxiosResponse<T>> {
        return this.httpService.request(config);
    }

    delete<T = any>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
        return this.httpService.delete(url, config);
    }

    get<T = any>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
        return this.httpService.get(url, config);
    }

    head<T = any>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
        return this.httpService.head(url, config);
    }

    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
        return this.httpService.patch(url, data, config);
    }

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
        return this.httpService.post(url, data, config);
    }

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
        return this.httpService.put(url, data, config);
    }
/*
    log(apiLog: ApiLog): Promise<AccessLogResponseDto> {
        const request = RequestContext.currentContext?.req;
        const accessLog = <AccessLog>apiLog;
        const realExpressAccessToken = request.headers['authorization'] ? request.headers['authorization'].replace('Bearer ', '') : null;
        if (realExpressAccessToken) {
            accessLog.accessToken = realExpressAccessToken;
        }
        accessLog.ip = (request.headers?.['incap-client-ip'] as string) ?? ((request.headers?.['x-original-forwarded-for']as string)?.split(',')?.[0] ?? (request.headers['x-forwarded-for'] as string));
        accessLog.hostName = request.headers['host'];
        accessLog.userAgent = request.headers["user-agent"];

        const host = this.configService.get<string>("AGENT_PROCESS_API_HOST");
        const endpoint = `http://${host}/log`;
        return this.post(endpoint, accessLog).toPromise().then((response) => {
            return plainToClass(AccessLogResponseDto, response.data)
        }).catch((error) => {
            this.logger.warn(`Failed to save access log into database: ${JSON.stringify(accessLog)}`);
            return null;
        });
    }
*/
}
