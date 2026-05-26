import { LoadingDialog } from "./loading.ts";
import * as utils from "./utils.ts";

async function main() {
    const loginUsernameInput = utils.query<HTMLInputElement>(
        "username-login-input",
    );
    const loginPasswordInput = utils.query<HTMLInputElement>(
        "password-login-input",
    );
    const loginButton = utils.query("#login-button")!;
    const errorElement = utils.query("#error")!;
    const loading = new LoadingDialog();
    const server = await utils.unauthorizedServer();

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
