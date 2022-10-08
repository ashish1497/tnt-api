export default interface MessageResponse {
  success: boolean;
  message: string;
  error: string;
  data?: any;
}
