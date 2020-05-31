import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class EmailVerifyTokenInput {
    @Field()
    token: string;
}

@ObjectType()
export class EmailVerifyTokenPayload {
    @Field()
    isVerified: boolean;
}
