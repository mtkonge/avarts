import { LoadingDialog } from "./loading.ts";
import * as utils from "./utils.ts";

function main() {
    const loginUsernameInput = document.getElementById(
        "username-login-input",
    ) as HTMLInputElement;
    const loginPasswordInput = document.getElementById(
        "password-login-input",
    ) as HTMLInputElement;
    const loginButton = document.getElementById("login-button")!;
    const errorElement = document.getElementById("error")!;
    const loading = new LoadingDialog();
    const server = utils.server();

    loginButton.addEventListener("click", async () => {
        loading.show();
        const result = await server.login(
            {
                username: loginUsernameInput.value,
                password: loginPasswordInput.value,
            },
        );
        loading.hide();
        if (!result.ok) {
            errorElement.textContent = result.error;
            return;
        }
        localStorage.setItem("token", result.data);
        location.href = "/";
    });
}

main();
