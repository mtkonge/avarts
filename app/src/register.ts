import { server } from "./utils.ts";

function main() {
    const registerUsernameInput = document.getElementById(
        "username-register-input",
    ) as HTMLInputElement;
    const registerPasswordInput = document.getElementById(
        "password-register-input",
    ) as HTMLInputElement;
    const registerButton = document.getElementById("register-button")!;
    const errorElement = document.getElementById("error")!;

    registerButton.addEventListener("click", async () => {
        const result = await server.register(
            registerUsernameInput.value,
            registerPasswordInput.value,
        );
        if (!result.ok) {
            errorElement.textContent = result.error;
            return;
        }
        location.href = "/login.html";
    });
}

main();
