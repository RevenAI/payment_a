import { loadEnvFile } from 'node:process'
loadEnvFile('./.env')

export const Config = {
    server: {
        env: process.env.NODE_ENV ?? 'development',
        port: process.env.PORT ?? '3001',
        host: process.env.HOST ?? '127.0.0.1',
    }
}

//settings
export const settings = {
    isDevMode: Config.server.env === 'development',
    isProdMode: Config.server.env === 'production',
}

export const PATH = {
    USER_PATH: './model/users/users.json',
    USER_TOKEN: './model/users/users_token.json'
}
