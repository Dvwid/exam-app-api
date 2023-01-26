import { UserDto } from './User.dto';

export interface UserCredentialsDto {
  user: UserDto;
  jwt: string;
}
