import { LoadingDialog } from "./loading.ts";
import * as utils from "./utils.ts";

async function main() {
    const registerUsernameInput = utils.query<HTMLInputElement>(
        "#username-register-input",
    );
    const registerPasswordInput = utils.query<HTMLInputElement>(
        "#password-register-input",
    );
    const registerButton = utils.query("#register-button");
    const errorElement = utils.query("#error");
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
