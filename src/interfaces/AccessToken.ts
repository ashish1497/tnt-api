export default interface AccessTokenInterface {
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  type: 'user' | 'delivery' | 'admin';
}
