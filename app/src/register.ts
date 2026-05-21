import { LoadingDialog } from "./loading.ts";
import * as utils from "./utils.ts";

async function main() {
    const registerUsernameInput = document.getElementById(
        "username-register-input",
    ) as HTMLInputElement;
    const registerPasswordInput = document.getElementById(
        "password-register-input",
    ) as HTMLInputElement;
    const registerButton = document.getElementById("register-button")!;
    const errorElement = document.getElementById("error")!;
    const loading = new LoadingDialog();
    const server = await utils.unauthorizedServer();

    registerButton.addEventListener("click", async () => {
        loading.show();
        const result = await server.register(
            {
                username: registerUsernameInput.value,
                password: registerPasswordInput.value,
            },
        );
        loading.hide();
        if (!result.ok) {
            errorElement.textContent = result.error;
            return;
        }
        location.href = "/login/";
    });
}

main();
