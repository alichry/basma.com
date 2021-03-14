import { format } from 'util';

export const handleResponse = async (res: Response) => {
  let body;
  if (res.status === 204) {
    return {};
  }
  try {
    body = await res.json();
  } catch (e) {
    throw new Error("An unknown server has occurred! Please try again later");
  }
  if (res.status < 200 || res.status > 299) {
    if (!body.message) {
      throw new Error("An unknown server has occurred! Please try again later");
    }
    if (body.message) {
      if (!body.errors) {
        throw new Error(body.message);
      }
      throw new Error(format("%s Reasons: %s", body.message, body.errors.join(', ')));
    }
    throw new Error("An unknown server has occurred! Please try again later");
  }
  return body;
}