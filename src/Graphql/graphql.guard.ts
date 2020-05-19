import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
  } from "@nestjs/common";
  import { JwtService } from "@nestjs/jwt";
  import { GqlExecutionContext } from "@nestjs/graphql";
  import { Utils } from 'utils/Utils';

  @Injectable()
  export class GqlAuthGuard implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
    ) { }
    
    async canActivate(context: ExecutionContext) {
      const request = GqlExecutionContext.create(context).getContext().req;;
      if (!request) {
        return false;
      }
      const authHeader = request.headers['authorization'];
      const refreshTokenHeader = request.headers['refreshtoken']
      const tokenParams = Utils.parseAuthHeader(authHeader);
      const refreshTokenParams = Utils.parseAuthHeader(refreshTokenHeader);
      if (!tokenParams || !refreshTokenParams ||
        tokenParams.scheme !== "Bearer" ||
        refreshTokenParams.scheme !== "Bearer"
      ) {
        throw new HttpException(
          {
            error: "Token is invalid",
            statusCode: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      try {
        const decoded = this.jwtService.verify(refreshTokenParams.value);
        request.user = decoded;
        return true;
      } catch (e) {
        if (e && e.name === "TokenExpiredError") {
          throw new HttpException(
            {
              error: "Session has been expired",
              statusCode: HttpStatus.UNAUTHORIZED,
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
        throw new HttpException(
          {
            error: "Authentication Error",
            statusCode: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }
  