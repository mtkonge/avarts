function fillTemplate(
    template: string,
    formatMarker: string,
    possibilities: string[],
) {
    while (template.includes(formatMarker)) {
        const picked =
            possibilities[Math.floor(Math.random() * possibilities.length)];
        template = template.replace(formatMarker, picked);
    }
    return template;
}

function trimWhitespace(input: string): string {
    return input.split("\n").map((x) => x.trimEnd()).slice(1, -1).join("\n");
}

interface Animation {
    render(): string;
    interval(): number;
}

class Skateboarder implements Animation {
    private static arms = ["--", "‾‾"];

    render(): string {
        const template = String.raw`
  o
$$|$$
 / \   
¨°¨°¨
`;

        return trimWhitespace(
            fillTemplate(template, "$$", Skateboarder.arms),
        );
    }

    interval(): number {
        return 1000;
    }
}

class Runner implements Animation {
    private iteration = 0;

    render(): string {
        this.iteration += 1;
        const anim0 = String.raw`
  o
 :|: 
.' :   
`;

        const anim1 = String.raw`
  o
.'|.'
 :.'   
`;

        const picked = [anim0, anim1][this.iteration % 2];
        return trimWhitespace(picked);
    }
    interval(): number {
        return 200;
    }
}
class Biker implements Animation {
    private iteration = 0;

    render(): string {
        this.iteration += 1;
        const template = String.raw`
     o
    /'._
  _.#.:_
 :$: ":$:   
  ‾    ‾
`;
        const spokes = ["/", "-", "\\", "|"];

        const picked = template.replaceAll("$", spokes[this.iteration % 4]);
        return trimWhitespace(picked);
    }

    interval(): number {
        return 100;
    }
}

export class LoadingDialog {
    private root: HTMLDialogElement;
    private animation: HTMLPreElement;
    private animationQueue: Animation[] = [];
    private progress = 0;

    constructor() {
        this.root = document.createElement("dialog");
        this.animation = document.createElement("pre");
        const x = document.createElement("pre");
        x.textContent = "LOADING";
        this.root.append(this.animation, x);
        document.body.append(this.root);
        this.start();
    }

    private start() {
        let lastAnimationAt = Date.now();
        let animationTimer = Infinity;
        const step = () => {
            if (this.progress >= 100) {
                this.animationQueue.shift();
                this.progress = 0;
                animationTimer = Infinity;
            }
            if (this.animationQueue.length === 0) {
                this.fillAnimationQueue();
            }
            const delta = Date.now() - lastAnimationAt;
            animationTimer += delta;
            lastAnimationAt = Date.now();
            if (animationTimer > this.animationQueue[0].interval()) {
                this.animation.textContent = this.animationQueue[0].render();
                animationTimer = 0;
            }
            this.progress += (delta / 1000) * 20;
        };
        step();
        setInterval(step);
    }

    private fillAnimationQueue() {
        const drafts = [new Skateboarder(), new Biker(), new Runner()];
        while (drafts.length > 0) {
            const idx = Math.floor(Math.random() * drafts.length);
            const [draft] = drafts.splice(idx, 1);
            this.animationQueue.push(draft);
        }
    }

    show() {
        this.progress = 0;
        this.root.showModal();
    }
    hide() {
        this.root.close();
    }
}
