import { isUUID } from '@nestjs/common/utils/is-uuid';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { fromGlobalId } from 'graphql-relay';
import { UserService } from 'User/user.service';
import { Node } from 'Node/models/node.models';

@Resolver()
export class NodesResolvers {
  constructor(
    private readonly usersService: UserService,
  ) {}

  @Query((_returns) => Node, { nullable: true })
  async node(
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<Node | undefined | null> {
    const resolvedGlobalId = fromGlobalId(id);
    if (!isUUID(resolvedGlobalId.id)) {
      return null;
    }
    switch (resolvedGlobalId.type) {
      case 'User':
        return undefined;
        // return await this.usersService.findOneById(resolvedGlobalId.id);
      default:
        break;
    }
    return null;
  }
}