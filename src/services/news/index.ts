import { TNewsProvider } from "./types";

import * as theedge from './theedege'
import * as ny from './ny'
import * as statdog from './statdog'


export * from './types'

export const NewsService: Record<string, TNewsProvider> = {
    ny,
    theedge,
    statdog
} as const