import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EnvironmentModule } from "Enviroment/enviroment.module";
import { EnvironmentService } from 'Enviroment/enviroment.service';
import { EnvConstants } from "common/constants/EnvConstants";
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [EnvironmentModule],
            inject: [EnvironmentService],
            useFactory: (environmentService: EnvironmentService) => ({
                transport: {
                service: 'gmail',
                port: 587,
                secure: false,
                auth: {
                    user: environmentService.getByKey(EnvConstants.USER_MAILER),
                    pass: environmentService.getByKey(EnvConstants.PASS_MAILER)
                }
                },
                defaults: {
                    from:'"nest-modules" <modules@nestjs.com>',
                },
                template: {
                    dir: __dirname + '/templates',
                    adapter: new PugAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
        }),
    ],
})

export class MailModule { };