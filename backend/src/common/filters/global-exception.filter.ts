import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtre global pour gérer toutes les exceptions de l'application
 * Fournit des réponses d'erreur cohérentes et loggées
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Une erreur interne est survenue';
        let errors: any = null;

        // Gestion des HttpException (erreurs NestJS)
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || exception.message;
                errors = (exceptionResponse as any).errors || null;
            } else {
                message = exceptionResponse as string;
            }
        }
        // Gestion des erreurs de validation class-validator
        else if (exception instanceof Error && exception.name === 'ValidationError') {
            status = HttpStatus.BAD_REQUEST;
            message = 'Erreur de validation';
            errors = exception.message;
        }
        // Gestion des erreurs TypeORM
        else if (exception instanceof Error && exception.name === 'QueryFailedError') {
            status = HttpStatus.BAD_REQUEST;
            message = 'Erreur de base de données';

            // Extraire le message d'erreur PostgreSQL
            const error = exception as any;
            if (error.code === '23505') {
                message = 'Cette entrée existe déjà (violation de contrainte unique)';
            } else if (error.code === '23503') {
                message = 'Référence invalide (violation de clé étrangère)';
            } else if (error.code === '23502') {
                message = 'Champ obligatoire manquant';
            }
        }
        // Autres erreurs
        else if (exception instanceof Error) {
            message = exception.message;
        }

        // Construire la réponse d'erreur
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            ...(errors && { errors }),
        };

        // Logger l'erreur
        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url} - ${status}`,
                exception instanceof Error ? exception.stack : exception,
            );
        } else {
            this.logger.warn(
                `${request.method} ${request.url} - ${status}: ${message}`,
            );
        }

        // Envoyer la réponse
        response.status(status).json(errorResponse);
    }
}
