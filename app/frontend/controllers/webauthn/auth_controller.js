import { Controller } from "stimulus";
import * as WebAuthnJSON from "@github/webauthn-json";
import { FetchRequest } from "@rails/request.js";

export default class extends Controller {
  static values = { callback: String };

  auth(data) {
    const _this = this;
    WebAuthnJSON.get({ publicKey: data })
      .then(async function (credential) {
        const request = new FetchRequest("post", "/webauthn/auth", {
          body: JSON.stringify(credential),
        });
        const response = await request.perform();

        if (response.ok) {
          const data = await response.json;
          window.Turbo.visit(data.redirect, { action: "replace" });
        } else {
          console.log("something is wrong", response);
        }
      })
      .catch(function (error) {
        console.log("something is wrong", error);
      });
  }

  submit(event) {
    event.preventDefault();
    const _this = this;
    var form = new FormData(event.target);
    fetch(event.target.action, {
      method: "POST",
      body: form,
    })
      .then((response) => {
        if (response.ok) return response.json();

        return Promise.reject(response);
      })
      .then((data) => {
        _this.auth(data, form);
      })
      .catch((error) => {
        console.error(
          "🚀 ~ file: auth_controller.js:46 ~ extends ~ submit ~ error:",
          error
        );
      });
  }
  error(event) {
    console.log("something is wrong", event);
  }
}
