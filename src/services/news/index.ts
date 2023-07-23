import { TNewsProvider } from "./types";

import * as theedge from './theedege'
import * as ny from './ny'
import * as statdog from './statdog'
import * as investing from './investing'

export * from './types'

export const NewsService: Record<string, TNewsProvider> = {
    ny,
    theedge,
    statdog,
    investing
} as const