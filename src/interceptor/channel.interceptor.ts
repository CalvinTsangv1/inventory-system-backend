import { Observable } from 'rxjs';
import { tap } from "rxjs/operators";
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';

type channelHeaderProps = {
    region?: string,
    channel?: string
};

@Injectable()
export class ChannelInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { headers, query, body } = request;
        const channelHeader = headers['rbc-channel'];
        const channelObj: channelHeaderProps = {};

        if (channelHeader) {
            channelHeader.split(";").map(headerValue => {
                const values = headerValue.split('=')
                channelObj[values[0]] = values[1] || null;
            })

            if (query) {
                request.query = {
                    ...query,
                    ...channelObj
                };
            }

            if (body && !Array.isArray(request.body)) {
                request.body = {
                    ...body,
                    ...channelObj
                };
            }
        }

        return next.handle();
    }

}
