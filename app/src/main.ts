import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type HTMLGeolocationElement = HTMLElement & {
    isValid: boolean;
    invalidReason: string;
    position: {
        coords: {
            longitude: number;
            latitude: number;
        };
    };
};

function main() {
    const geo = document.getElementById("geo")! as HTMLGeolocationElement;
    const info = document.getElementById("info")!;
    try {
        geo.addEventListener("location", () => {
            info.textContent =
                `"${geo.isValid}", "${geo.invalidReason}", "${geo.position.coords.longitude} ${geo.position.coords.latitude}"`;
        });
        const map = new maplibregl.Map({
            container: "map",
            style: "https://tiles.openfreemap.org/styles/bright",
            center: [geo.position.coords.longitude, geo.position.coords.latitude],
            zoom: 10
        })
    } catch (err: unknown) {
        info.textContent = String(err);
    }

}

main();
