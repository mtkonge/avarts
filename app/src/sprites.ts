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

function stripStartAndEnd(input: string): string {
    return input.split("\n").slice(1, -1).join("\n");
}

class Skateboard {
    private static arms = ["--", "‾‾"];

    render(): string {
        const template = String.raw`
    o
  $$|$$
   / \   
''o'''o''
`;

        return stripStartAndEnd(
            fillTemplate(template, "$$", Skateboard.arms),
        );
    }
}

class Running {
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
        return stripStartAndEnd(picked);
    }
}
class Bike {
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
        return stripStartAndEnd(picked);
    }
}

const biker = new Bike();
const skateboarder = new Skateboard();
const runner = new Running();

document.getElementById("skateboard")!.textContent = skateboarder.render();
document.getElementById("runner")!.textContent = runner.render();
document.getElementById("bike")!.textContent = biker.render();

setInterval(() => {
    document.getElementById("skateboard")!.textContent = skateboarder.render();
}, 1000);

setInterval(() => {
    document.getElementById("runner")!.textContent = runner.render();
}, 200);

setInterval(() => {
    document.getElementById("bike")!.textContent = biker.render();
}, 100);
