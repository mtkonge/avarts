import * as esbuild from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";

async function build(path: string) {
    await esbuild.build({
        plugins: [...denoPlugins()],
        entryPoints: [`./src/${path}.ts`],
        outfile: `./dist/${path}.js`,
        bundle: true,
        format: "esm",
    });
}

async function buildCode() {
    await build("main");
    await build("login");
    await build("register");
    await build("profile");
    await esbuild.stop();
}

async function copyStatic(path: string[] = []) {
    const dir = path.join("/");
    await Deno.mkdir("dist/" + dir).catch((_) => _);
    for await (const file of Deno.readDir(`static/${dir}`)) {
        if (file.isDirectory) {
            await copyStatic([...path, file.name]);
            continue;
        }
        await Deno.copyFile(
            `static/${dir}/${file.name}`,
            `dist/${dir}/${file.name}`,
        );
    }
}

type BundleOptions = {
    quiet?: boolean;
};

export async function bundle(options?: BundleOptions) {
    if (!options?.quiet) {
        console.log("info: copying static files");
    }
    await copyStatic();
    if (!options?.quiet) {
        console.log("info: building code");
    }
    await buildCode();
    if (!options?.quiet) {
        console.log("success: output in 'dist/'");
    }
}

if (import.meta.main) {
    await bundle();
}
