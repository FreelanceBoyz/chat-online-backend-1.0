import { ObjectType } from '@nestjs/graphql';
import { EdgeType } from 'common/connection-paging';
import { User } from 'User/models/user.models';

@ObjectType()
export class UserEdge extends EdgeType(User) {}