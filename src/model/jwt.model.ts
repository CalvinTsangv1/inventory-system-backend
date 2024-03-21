import {PermissionModel} from "./permission.model";

export interface JwtModel {
    aud: string;
    auth_time: number;
    iss: string;
    user_id: string;
    sub: string;
    permissions: Array<PermissionModel>;
    firebase: firebase;
    distinct: string;
    domain: string;
}

interface firebase {
    identities: Identity;
    sign_in_provider: string;
}

interface Identity {
    phone: Array<string>;
}