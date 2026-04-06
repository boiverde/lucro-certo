import { FastifyInstance } from 'fastify'

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      sub: string;
      [key: string]: any;
    }
  }
}
