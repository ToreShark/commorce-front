export interface SessionPayload extends Record<string, any> {
    userId: string;
    expiresAt: Date;
    // Здесь можете добавить другие свойства, если необходимо
  }