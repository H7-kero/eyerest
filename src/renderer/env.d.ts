export {}
import type { EyerestApi } from '../../preload/index'

declare global {
  interface Window {
    eyerest: EyerestApi
  }
}