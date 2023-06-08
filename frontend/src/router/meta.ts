export enum AuthState {
    Any = 'any',
    LoggedIn = 'user',
    LoggedOut = 'anon',
}

export interface RouterMeta {
    auth?: AuthState;
}

export interface ChildRouteMeta {
    friendlyName: string;
    icon: string;
}
