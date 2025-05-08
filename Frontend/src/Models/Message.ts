export interface Message {
    event: string;
    origin: string;
    context: string;
    status: string;
    payload: {
        esp32Connected?: boolean;
        message?: string;
        user_id?: number;
        user?: {
            id?: number;
            username?: string;
            email?: string; 
        }
    };
}