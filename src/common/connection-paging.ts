import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import * as Relay from 'graphql-relay';

export function EdgeType<T>(classRef: Type<T>): any {
    @ObjectType({ isAbstract: true })
    abstract class Edge implements Relay.Edge<T> {
      @Field(() => classRef)
      node: T;
  
      @Field((_type) => String, {
        description: 'Used in `before` and `after` args',
      })
      cursor: Relay.ConnectionCursor;
    }
  
    return Edge;
  }