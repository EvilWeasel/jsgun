import * as util from "util";
import * as inspector from "inspector";
import * as vscode from "vscode";

export class DebuggerUtils implements vscode.Disposable {
  private session: inspector.Session | null = null;

  constructor() {
    this.enableRuntime();
  }

  private async enableRuntime() {
    if (inspector.url() === null) {
      inspector.open();
    }

    this.session = new inspector.Session();
    this.session.connect();

    const post = <any>util.promisify(this.session.post).bind(this.session);

    await post("Debugger.enable");
    await post("Runtime.enable");

    return post;
  }

  async post(method: string, params?: object) {
    if (!this.session) {
      throw new Error("Session is not initialized");
    }

    const post = <any>util.promisify(this.session.post).bind(this.session);
    return post(method, params);
  }

  dispose() {
    if (this.session) {
      this.session.disconnect();
    }
    inspector.close();
  }
}
