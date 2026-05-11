import { server } from "./utils.ts";

function main() {
    const loginUsernameInput = document.getElementById(
        "username-login-input",
    ) as HTMLInputElement;
    const loginPasswordInput = document.getElementById(
        "password-login-input",
    ) as HTMLInputElement;
    const loginButton = document.getElementById("login-button")!;
    const errorElement = document.getElementById("error")!;

    loginButton.addEventListener("click", async () => {
        const result = await server.login(
            {
                username: loginUsernameInput.value,
                password: loginPasswordInput.value,
            },
        );
        if (!result.ok) {
            errorElement.textContent = result.error;
            return;
        }
        localStorage.setItem("token", result.data);
        location.href = "/";
    });
}

main();
