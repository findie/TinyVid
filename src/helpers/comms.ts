import {isJSONProtocolError, JSONProtocolResponse} from "../../electron/protocols/base-protocols";

function getJSONProtocolDataOrThrow<T>(data: JSONProtocolResponse<T>): T {
  if (isJSONProtocolError(data)) {
    const e = new Error(data.error.message);
    Object.assign(e, data.error);
    throw e;
  }

  return data.success;
}
