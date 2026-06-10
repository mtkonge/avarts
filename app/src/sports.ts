import { SportId, sportNames } from "@avarts/shared";

export class SportSelector {
    private root: HTMLDialogElement;
    public selectedSport: SportId = "legs";

    constructor(private showButton: HTMLElement) {
        this.root = document.createElement("dialog");
        this.loadSport();
        this.prepareDialog();
        this.showButton.addEventListener("click", () => {
            this.show();
        });
    }

    private loadSport() {
        try {
            const savedSport = localStorage.getItem("sport");
            const sport = SportId.parse(savedSport);
            this.select(sport);
        } catch {
            this.select("legs");
        }
    }

    private prepareDialog() {
        this.root.classList.add("sport-dialog");
        this.root.addEventListener("mousedown", (event) => {
            if (event.target === event.currentTarget) {
                this.close();
            }
        });

        const dialogWrapper = document.createElement("div");
        dialogWrapper.classList.add("dialog-wrapper");

        const closeButtonWrapper = document.createElement("div");
        closeButtonWrapper.classList.add("close-button-wrapper");

        const closeButton = document.createElement("button");
        closeButton.textContent = "×";
        closeButton.classList.add("close-button");
        closeButton.addEventListener("click", () => {
            this.close();
        });

        const ul = document.createElement("ul");
        for (const [id, display] of Object.entries(sportNames())) {
            const li = document.createElement("li");
            li.classList.add("leaderboard-item");
            const button = document.createElement("button");
            button.textContent = `${display.emoji} ${display.name}`;
            button.addEventListener("click", () => {
                this.select(id as SportId);
                this.close();
            });
            li.append(button);
            ul.append(li);
        }
        closeButtonWrapper.appendChild(closeButton);
        dialogWrapper.append(closeButtonWrapper, ul);
        this.root.append(dialogWrapper);
        document.body.append(this.root);
    }

    private select(id: SportId) {
        const display = sportNames()[id];
        this.showButton.textContent = display.emoji;
        localStorage.setItem("sport", id);
        this.selectedSport = id;
    }

    show() {
        this.root.showModal();
    }
    private close() {
        this.root.close();
    }
}
