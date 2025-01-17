export enum BasicStatus {
   DISABLE,
   ENABLE,
}

export enum OfficeStatus {
   DISABLE = 1,
   ENABLE = 0,
}

export enum ResultStatus {
   SUCCESS = 1,
   ERROR = 0,
}

export enum ResultEnum {
   SUCCESS = 0,
   ERROR = -1,
   TIMEOUT = 401,
}

export enum StorageEnum {
   UserInfo = 'userInfo',
   UserToken = 'userToken',
   Settings = 'settings',
   I18N = 'i18nextLng',
}

export enum ThemeMode {
   Light = 'light',
   Dark = 'dark',
}

export enum ThemeLayout {
   Vertical = 'vertical',
   Horizontal = 'horizontal',
   Mini = 'mini',
}

export enum ThemeColorPresets {
   Default = 'default',
   Cyan = 'cyan',
   Purple = 'purple',
   Blue = 'blue',
   Orange = 'orange',
   Red = 'red',
}

export enum LocalEnum {
   en_US = 'en_US',
   vi_VN = 'vi_VN',
}

export enum MultiTabOperation {
   FULLSCREEN = 'fullscreen',
   REFRESH = 'refresh',
   CLOSE = 'close',
   CLOSEOTHERS = 'closeOthers',
   CLOSEALL = 'closeAll',
   CLOSELEFT = 'closeLeft',
   CLOSERIGHT = 'closeRight',
}

export enum PermissionType {
   CATALOGUE,
   MENU,
   BUTTON,
}
