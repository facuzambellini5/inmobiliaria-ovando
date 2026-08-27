/**
 * Estos dos tipos son el "contrato" con el backend para el login.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  username: string;
}
