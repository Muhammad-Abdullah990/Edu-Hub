export * from "./generated/api";
export * from "./generated/api.schemas";
export {
  setBaseUrl,
  setAuthTokenGetter,
  setCsrfTokenGetter,
  customFetch,
  ApiError,
} from "./custom-fetch";
export type { AuthTokenGetter, CsrfTokenGetter } from "./custom-fetch";
