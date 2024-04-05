import { Buffer } from 'buffer'

export function toBase64(input: string) {
    return Buffer.from(encodeURIComponent(input), 'utf-8').toString('base64')
}

export function fromBase64(encoded: string) {
    return decodeURIComponent(Buffer.from(encoded, 'base64').toString('utf8'))
}