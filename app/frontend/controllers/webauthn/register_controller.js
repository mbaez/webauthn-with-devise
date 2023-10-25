import { Controller } from "stimulus";
import * as WebAuthnJSON from "@github/webauthn-json";
import { FetchRequest } from "@rails/request.js";

export default class RegisterController extends Controller {
  static targets = ["nickname"];
  static values = { callback: String };

  challenge(data, form) {
    var nickname = document.querySelector("input[name*=nickname]");
    WebAuthnJSON.create({ publicKey: data })
      .then(async function (credential) {
        const request = new FetchRequest(
          "post",
          `/webauthn/credentials.json?nickname=${nickname.value}`,
          { body: JSON.stringify(credential), responseKind: "turbo-stream" }
        );
        const resp = await request.perform();
        if (resp.ok) location.reload();
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
        _this.challenge(data, form);
      })
      .catch((error) => {
        console.error(
          "🚀 ~ file: register_controller.js:51 ~ RegisterController ~ submit ~ error:",
          error
        );
      });
  }
  error(event) {
    debugger;
    console.log("something is wrong", event);
  }
}
