import { Query, Resolver } from '@nestjs/graphql';

import { UserService } from 'User/user.service';
import { User } from 'User/models/user.models';
import { BasicResponse } from 'common/common-models';

@Resolver(() => User)
export class UserResolvers {
  constructor(private readonly usersService: UserService) {}

  @Query(_returns => BasicResponse)
  async UserGraphInfo() {
    return {
      message: 'cac',
      statusCode: 200,
    };
  }
}
