export interface Result<T = any> {
   success: boolean;
   error: boolean;
   status: number;
   message: string;
   reason: string;
   details: { [key: string]: any };
   data?: T;
}
