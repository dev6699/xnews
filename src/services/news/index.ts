import { TNewsProvider } from "./types";

import * as theedge from './theedege'
import * as ny from './ny'

export * from './types'

export const NewsService: Record<string, TNewsProvider> = {
    ny,
    theedge,
} as const