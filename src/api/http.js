import axios from "axios";

/**
 * One axios client for every provider. The public job APIs used here are all
 * keyless and CORS-enabled, so requests go straight from the browser - there
 * is no backend of our own to proxy through.
 */
const http = axios.create({
  timeout: 15000,
  headers: { Accept: "application/json" },
});

/** Turn an axios failure into something a user can actually read. */
export function describeError(error, sourceLabel) {
  if (axios.isCancel?.(error) || error?.code === "ERR_CANCELED") {
    return { canceled: true, message: "Request canceled" };
  }

  const status = error?.response?.status;
  if (status === 429) {
    return { message: `${sourceLabel} is rate-limiting us. Try again in a minute.` };
  }
  if (status === 403 || status === 401) {
    return { message: `${sourceLabel} refused the request (HTTP ${status}).` };
  }
  if (status >= 500) {
    return { message: `${sourceLabel} is having server trouble (HTTP ${status}).` };
  }
  if (error?.code === "ECONNABORTED") {
    return { message: `${sourceLabel} timed out.` };
  }
  if (error?.message === "Network Error") {
    return { message: `Could not reach ${sourceLabel} - network or CORS blocked it.` };
  }
  return { message: `${sourceLabel}: ${error?.message || "unknown error"}` };
}

export default http;
