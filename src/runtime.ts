import * as util from "util";
import * as inspector from "inspector";

export let session: inspector.Session | null = null; // Declare the session variable outside the activate function

export async function enableRuntime() {
  if (inspector.url() === null) {
    inspector.open();
  }

  session = new inspector.Session();
  session.connect();

  const post = <any>util.promisify(session.post).bind(session);

  await post("Debugger.enable");
  await post("Runtime.enable");

  return post;
}
