
import { Module } from '@nestjs/common';
import { NodesResolvers } from './node.resolvers';
import { UserModule } from 'User/user.module';

@Module({
  imports: [UserModule],
  providers: [NodesResolvers],
})
export class NodesModule {}