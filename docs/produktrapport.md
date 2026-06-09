# Avarts

_Mikkel Kongsted &lt;mtkongsted@gmail.com&gt;, Theis Pieter Hollebeek
&lt;tphollebeek@gmail.com&gt; - 26.5.2026_

Avarts er en web-app, hvor en bruger kan oprette og køre ruter. Brugeren kan
konkurrere med andre brugere med sit eget transportmiddel ved at kæmpe om den
bedste tid på en given rute indenfor det transportmiddel.

Løsningen består af en web-app med et verdenskort og en backend server der
kommunikere over HTTP sammen med web-appen. Udover det har vi også en shared
mappe der beskriver typer og funktioner både backend server og web-appen bruger.

Koden og andre relevante materialer ligger på Github repo'et [^1]

## Typescript

Hele vores projekt er skrevet i Typescript. Vi har valgt at skrive alting i
Typescript, da vi har meget erfaring i det, og kan dele kode mellem app og
backend, f.eks. datastrukturer.

Typescript kan både transpiles til browser Javascript, og til native Javascript.

Browser Javascript køres med brugeren's browser's Javascript runtime, dette er i
kontrast til native Javascript, som kører vha. en native javascript runtime. Vi
har valgt Deno som vores native runtime. Vi har derudover også skrevet vores
build scripts, som har ansvaret for at transpile vores webapp til browser
javascript, i Deno, da det betyder at vi ikke behøver at bruge både Deno og
Node, som var den eneste (viable) runtime, før at Deno blev lavet.

Vi har valgt Typescript frem for Javascript, da vi har vurderet, at muligheden,
til at statisk garantere at størstedelen af vores software er korrekt, sparer os
nok tid, til at det er den ekstra tidsinvestering værd.

Da Typescript kun eksisterer som et lag ovenpå Javascript, som ikke eksisterer i
runtime, kan vi ikke garantere at ukendt data, f.eks. data læst fra filer, eller
hentet over netværket, er korrekt. Der er derudover begrænsninger på
Typescript's type system.

For at overkomme dette, har vi suppleret med librariet `zod`. Zod tilbyder
runtime validering af data, og understøtter Typescript.

## Zod

Applikationen tager stor brug af Javascript librariet `zod`. Zod gør det muligt
at definere schemas, som man derefter kan bruge til at parse ukendt data. Vi har
brugt det til at validere alt fra requests og responses, til json data vi læser
fra filer. Da Typescript kun eksisterer i compile time, og der ikke findes
statiske typer i Javascript, hjælper det os med at garantere at alt dynamisk
ukendt data, der kommer i runtime, hvor Typescript ikke kan garantere noget,
faktisk er det data, som vi tror det er.

Zod tillader dig derudover at få en Typescript type der beskriver dit schema, ud
fra det schema du har defineret, som betyder at det spiller perfekt sammen med
vores brug af Typescript.

Vi har valgt at bruge dette library, da vi havde tidligere erfaring med det, og
at være sikker på at vi har den rigtige struktur, sparer os, ligesom Typescript,
tid i længden, efter en upfront tidsinvestering. Vi har vurderet at denne
tidsinvestering er langt mindre, end det gavn vi får fra det.

## Results

Til error handling har vi, frem for at bruge exceptions og try/catch, taget
inspiration fra funktionelle sprog og deres Result type.

Det er implementeret som en tagged union med en værdi, eller en fejl. Altså:

```ts
type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E> = Ok<T> | Err<E>;
```

Det har vi gjort pga. det har et par goder, som exceptions ikke har.

Det er muligt at se hvilke fejl, en funktion kan returnere, ud fra dens
signatur. Sammenlign de følgende funktionssignaturer:

```ts
function read_file_a(): string;

function read_file_b(): Result<string, string>;
```

Man kan i `read_file_a` ikke se, at den kaster en fejl. Derudover, kan man ikke
se hvornår den **ikke** kaster en fejl. Det betyder, at man kan håndtere
exceptionen fra en funktion, alá dette:

```ts
try {
    read_file();
} catch {
    console.error("could not read file");
}
```

Men hvis man senere hen refactorer `read_file_exception` til, at ikke kaste
exceptions, er der intet der kan advare dig, om at du har et unødvendigt
try-catch.

Derudover, skaber det også trælse træer med meget indentation, og betyder man
skal læse koden "op-ned-op-ned-op-ned" (try, catch, try, catch, try, catch) som
er unnaturligt, og i længere filer i praksis gør, at det er sværre at finde ud
af, hvilken catch block der tilhører hvilken try block.

```ts
try {
    const file = read_file();
    try {
        const parsed = parse_file(file);
        try {
            /* etc. */
        } catch {
            /* etc. */
        }
    } catch {
        console.error("could not parse file");
    }
} catch {
    console.error("could not read file");
}
```

Dette er taget til kontrast med Result typen. Vi kan med Typescript's type
system garantere, at man håndterer fejlen.

```ts
const file_result = read_file();

// err: member `value` does not exist on type `{ ok: true, value: string } | { ok: false, error: string }`
const file_data = file_result.value;

if (!file_result.ok) {
    console.error(`could not read file: ${file_result.error}`);
    return;
}

// fordi vi har `return`'ed når file_result.ok === false, kan Typescript's type system vide,
// at file_result kun kan være en `Ok<string>`, og vi kan derfor få adgang til dens værdi.

const file_data = file_result.value;
/* etc. */
```

Og hvis vi nu refactorer read_file, så den ikke kan fejle, kan typescript
fortælle os, at vi tjekker for fejl, der ikke kan ske:

```ts
const file_result = read_file();

// err: member `ok` does not exist on type `string`
if (!file_result.ok) {
    // err: member `error` does not exist on type `string`
    console.error(`could not read file: ${file_result.error}`);
    return;
}

// err: member `value` does not exist on type `string`
const file_data = file_result.value;
/* etc. */
```

Derudover løser det også vores problem med mange indents, og at error handling
kode ikke ligger tæt på, der hvor den fejlende funktion ligger:

```ts
const file = read_file();
if (!file.ok) {
    console.error("could not read file");
    return;
}
const parsed = parse_file(file.value);
if (!parsed.ok) {
    console.error("could not parse file");
    return;
}
```

Vi har i stedet reserveret Exceptions til brug som en `panic` funktionalitet,
dvs. fejl i softwaren, hvor at vores antagelser er forkert. Eksempelvist:

```ts
const mapElement = document.querySelector("#map");
if (mapElement === null) {
    throw new Error(
        "unreachable: index.html does not have an element with an id of #map",
    );
}
```

## Web-appen

Web-appen er implementeret med HTML, CSS og Typescript. Vi har brugt Deno som
Typescript/Javascript runtime og bruger vores egne scripts, der bruger esbuild
til at bygge appen. Vi har brugt maplibre-gl til at verdenskortet.

Vi har valgt Typescript da vi har meget erfaring i det, og det nemt kan
transpiles til det Javascript, som HTML dokumenter bruger. Vi har valgt
Typescript i stedet for Javascript, da vi så kan statisk garantere at vores
kodes typer er korrekte. Vi synes, at det tid vi sparer med fejlfinding med
Typescript, gør (the upfront investment worth it).

Vi har valgt at bruge Deno, da vi vurdere, at det er et bedre alternativ til
Node. Vi mener at måden Deno håndtere dependencies på, er mere intuitiv end
måden Node gør det.

Vi har valgt at bygge vores egne scripts med esbuild, da det giver os mere
frihed. Vi startede med at bruge Vite, men dette fandt vi ud af gav problemer
når man brugte et monorepo setup med deno workspaces. I det at vi begyndte at
bruge shared mappen til deling af typer og funktioner til både backenden og
appen, skiftede vi til vores egne scripts. Vi har brugt disse scripts i andre
projekter før.

Vi bruger Deno til at køre vores build scripts, som vha. af et plugin, gør at vi
kan få dependency management som vi kender det fra Deno, men transpiled til
browser-kompatibel Javascript.

Vi har valgt at bruge maplibre-gl med openstreetmaps som datakilde. Det har vi
gjort for at undgå at bøvle med api nøgler og betaling af licens, som vi skulle,
hvis vi byggede ovenpå f.eks. google maps' api.

Det har alt som vi ellers vil have i en kort library, som f.eks. inkluderede
typescript typer, og rotation, at tegne ruter, og så videre.

### Oprettelse af rute

Man kan oprette en rute ved at trykke på "Opret rute" knappen ("Create route") i
toolbar'en øverst på siden.

Derefter begynder vi vha. browseren's geolocation at mappe hvilken rute brugeren
har taget.

Det tegner vi som en linje bag brugeren.

Når brugeren er færdig, kan han trykke på knappen "Færdiggør rute" ("Finish
route"), som ligger der hvor den tidligere Opret rute knap ligger. Brugeren
bliver derefter spurgt om at navngive ruten, hvorefter den bliver send til
backenden og oprettet i databasen.

Brugeren får så hentet alle de nyeste ruter, inklusiv deres egen, og de bliver
tegnet på kortet.

### Kørelsen af et 'run'

Når en bruger kører et run skal man have en måde at verificere om brugeren har
kørt ruten korrekt. Den måde vi er endt med at gøre dette på er ved give en
radius omkring alle checkpoints i ruten. Denne radius skal man så køre igennem
for at opnå checkpoint'et.

TODO Forklar matematikken og også hvorfor vi bruge linjer mellem sidste og
nuværende element for af finde om vi er igennem et checkpoint.

TODO Forklar konverteringen af meter til geo koordinater altså latitude og
longidude, og hvorfor det rent faktisk ikke er en radius, men nærmere ovaler.

Når man starter et run bliver ruten markeret med grå, hvor derefter når man når
de forskellige checkpoints i ruten vil den del af ruten du har kørt bliver
markeret med blåt. Man kan derfor se hvis man er kommet til at undvige et
checkpoint i løbet af sit run.

I starten da vi lavede vores kode til verificering af et run valgte vi en radius
på cirka 5 meter. Efter at have været ude at teste det, fandt vi ud af at den
geolocationsdata vi fik var ret ustabil. Nogle gange kunne geolocationsdataen
godt være en del meter væk fra vores korrekte location.

Det betød at i de fleste tilfælle ville man misse et checkpoint på grund af
dette. Efter vi havde testet det ændrede vi det til cirka 15 meter. Dette virker
bedre, men man kan godt indimellem opleve at locationsdataen er så ukorrekt at
man stadig ikke når de checkpoint, man burde have kørt igennem hvis dataen være
mere præcis.

Vi har vurderet at 15 meter er godt nok. Vi vil gerne undgå at ruternes
checkpoints er urealistiske, altså at man rammer et checkpoint selvom man er
utroligt langt væk fra det, men samtidig vil vi også gerne undgå brugeren føler
sig snydt fordi geolocationsdataen var for dårlig.

### Leaderboard og profil

Hvis man vælger en rute ved at trykke på den, kan man vha. "Leaderboard"
knappen, der viser sig, se leaderboardet for den rute.

Den viser en liste af 'runs', sorteret efter hvor lang tid de tog om at klare
ruten.

Hvis der er mere end én sportsgren brugt på den rute, f.eks. "Cykel" og
"Skateboard", får brugeren muligheden for at filtrere efter sportsgren.

Rankering er baseret på filtreringen af sportsgrenene. F.eks. hvis du har valgt
at ikke filtrere, kan en bruger i bil være nr. 1 og en bruger i cykel som nr 2.
Hvis du har filtreret efter sportsgren, viser den kun placeringen i den
sportsgren, f.eks. cyklen der før var #2, er nu #1.

Run'sne inkluderer transportmiddel og brugeren. Hvis man klikker på brugerens
navn, bliver man bragt til den brugers profil.

Man kan komme til sin egen profil ved at trykke på "Min profil" ("My profile")
knappen i toolbaren øverst.

Profilen viser hhv. hurtigste runs, og run'sne der skete for nyligt. Run'sne
inkluderer hvor brugeren er placeret på leaderboardet.

### Forbindelsen til backend serveren

server interface etc etc validation med zod etc etc tabel med ruter -> req/res
etc

TODO

### User auth

TODO

### Dependency resolution ved abstraktioner

TODO geomap :3 (basically business logic)

Vi har lavet en abstraktion over `maplibregl`, som vi har kaldet `MapHelper`.
Det har vi gjort, pga. at maplibregl har en meget verbose syntax, og vi ikke gad
at blande maplibregl specifikt funktionalitet (tegne linjer på kortet, etc),
sammen med vores `GeoMap` konstrukt.

Grundet at kortet skal være interaktivt, ved at man klikker på ruter for at
kunne se leaderboard og at køre på en rute, skal vi oprette event listeners, og
kalde funktionalitet som `GeoMap` har, da vi vil ikke have, at `MapHelper` ved,
at GeoMap eksisterer.

Det betyder lige nu, at `GeoMap` kræver `MapHelper`, og vice versa:

![alt text](geomap_circular_dependency.png)

Dette kalder man også en circular dependency. Problemet med circular
dependencies er, at de er umulige at resolve. Vi har derfor i stedet givet
`MapHelper` nogle late callbacks. Dsv, vi opretter `MapHelper` uden den krævede
dependency til `GeoMap`, som vi så bruger til at oprette `GeoMap`, og derefter
kan vi sætte medlemmerne til en callback der referrerer til `GeoMap`.

Hvis vi skulle gøre det om igen, ville vi lave denne abstraktion anderledes, da
det blev meget mudret hvad der er `GeoMap`'s ansvar og hvad der er `MapHelper`'s
ansvar, da de arbejder meget tæt sammen.

Man kunne i stedet for late functions, når ruter tegnes, returnere en liste af
`MapLine`s, én for hver rute, som `GeoMap` kunne tilføje event listeners til,
osv.

Eksempelvist:

```ts
class MapLine {
    constructor(private owner: MapHelper, id: number) {}

    on(type: "click", callback: () => void) {
        this.owner.findLineWith(id).on("click", () => {
            callback();
        });
    }
}
```

## Backend server

<p align="center">
  <img src="backend_structure.png"/>
</p>

Backend serveren er også skrevet skrevet i Typescript med Deno. Her kører vi
Typescript filerne direkte med Deno. Vi bruger Oak til at håndtere vores http
requests og middleware. Til kryptering af passwords bruger vi bcrypt. Vores
database er implementeret ved at gemme objekterne i json filer på harddisken.

Vi har valgt at bruge Oak da vi har tidligere erfaring med det, og det er den
mest populære måde at lave servere i Deno på, som betyder at der er mange
ressourcer og libraries.

Vi har brugt bcrypt da det er et populært værktøj til kryptering. Det er vigtigt
at man vælger krypteringsværktøjer man kan stole på og da bcrypt er en
industri-standard for kryptering, og det er den vi har mest erfaring med,
vurderer vi at det er den bedste at bruge til at løse vores problem.

### Business logic

Vi har valgt at følge princippet Seperation of Concerns, og afkoble vores
business logic, fra vores http api.

Vores business logic er implementeret som en serie af funktioner, som modtager
relevant data, og et interface til Database og Sessions, der returnerer et
resultat. Det betyder, at vi ikke håndterer api'ens problemer i vores business
logic, og business logic problemer i vores api, som gør det nemmere at overskue.

Det gør det også nemmere at evt. teste, da vi nu kan lave unit tests på vores
business logic, frem for at være tvunget til at lave end-to-end tests.

Her er et eksempel.

```ts
// server/src/business_logic
type UserWithIdError = "bad_user" | "db_error";

export async function userWithId(
    request: { id: number },
    database: Database,
): Promise<Result<{ user: UserWithId }, UserWithIdError>> {
    // ...
}
```

Dette er vores business logic for ruten "/user-from-id". Her kan vi lave kald
mod databasen for at få det data vi har brug for. Vi sørger for at returnere
beskrivelser af de fejl der nu må opstå. Her kan vi se at fejlende kan være
enten 'bad_user' eller 'db_error'. Dette kan vi parse, når vi bruger metoden i
vores ruter.

```ts
// server/src/api/user
router.post(
    "/user-from-id",
    parse(
        UserFromIdRequest,
        UserFromIdResponse,
        async (req): Pmr<UserFromIdResponse> => {
            const result = await businessLogic.userWithId(
                req,
                database,
            );
            // ...
        },
    ),
);
```

Dette er vores rute der bruge vores business logic metode 'userWithId' som
beskrevet overfor. Her laver vi ikke kald mod databasen. (todo: måske skrive
lidt mere. Noget konkluderende måske?)

### Database

Databasen er defineret som et interface kaldet `Database`. Vi har derefter
skrevet en implementation af det interface, `JsonDb`. Den fungerer som en
in-memory database, med den forskel, at efter at der skrives til databasen,
dumper vi alt dataen i diverse relaterede json filer ("routes.json" til ruter,
f.eks), som loades når `JsonDb` skabes. Filen læst køres naturligvis gennem zod.

Vi har valgt at definere `Database` som et interface, da det gør det nemmere at
evt. skrive tests til f.eks. vores business logic i fremtiden, hvis vi
vurderede, at det var nødvendigt.

Et problem med vores JsonDb implementering er at det hele loades i memory. Hvis
vores database bliver tilpas stor kan det skabe problemer hvis serveren
backenden kører på ikke har nok ressourcer.

Vi er opmærksomme på dette problem, da vi lavede det, men har vurderet at det
ikke er noget der kommer til at være et problem for os, eftersom selv hvis hver
element tog én mb (det er nok snarere et par kb eller bytes), skulle der flere
tusinde brugere og ruter til, før vi løber tør for de 2-8gb ram, som de fleste
servere tilbyder.

Derudover bruger alting vores `Database` interface, som gør at man på under en
arbejdsdag kan udskifte databaseimplementationen med f.eks. sqlite eller mysql.

### Api

Vores api er implementeret som en serie af POST ruter, gennem Oak.

Vi validererer alle requests vha. `zod` schemas, som ligger under shared, så vi
både kan validere på frontenden og på backenden.

Da Oak ikke tillader, at statisk garantere at ens response body følger en type,
har vi skrevet noget middleware, der vha. den tilhørende Response schemaet til
den givne rute, validerer at responsen er korrekt. Vi kan derudover ved hjælp af
vores middleware, statisk garantere at responsen ser korrekt ud. Da vi alligevel
skulle parse requesten, inkluderede vi det som en del af middlewarens ansvar
også.

### Sessions

For at vi bedre kan statisk garantere, at tokens altid er inkluderet, har vi
valgt at inkludere det som en del af request body'en, da vi så kan validere at
den er der vha. `zod`, frem for at bruge cookies.

På grund af det, har vi også valgt, at sende en token med response body'en når
man logger ind, og manuelt gemme den vha. local storage, ift. automatisk som man
kan med cookies.

Vi har vurderet, at dette giver mere mening for os, ift. at bruge cookies, da vi
undgår både at skulle huske at vedligeholde cookies, og ekstra dependencies til
at kunne bruge cookies.

Til tokens, genererer vi et uuidv4 vha. `crypto` fra Javascript's standard
library.

## Delte typer i mellem web-app og backend

En af de første problemer vi opdagede var at typerne fra backenden også skulle
bruges på frontenden. For eksempel hvordan en rute så ud, men også hvordan
requests og responses til og fra backenden så ud. For at undgå at skulle skrive
disse typer 2 gange og undgå fejl hvis man glemmer at opdatere begge steder, har
vi valgt at lave en mappe i vores projekt der hedder 'shared'. Her har vi
beskrevet typer og funktioner, vi bruger i hele vores projekt.

Her er et eksempel. På hvordan vores shared mappe bruges.

```ts
// shared/requests.ts
export const AddRouteRequest = z.strictObject({
    route: Route,
    token: z.string(),
});
```

Her definere vi en zod typen AddrouteRequest. 'z' her er zod.

```ts
// server/src/api/route.ts
router.post(
    "/add-route",
    parse(
        AddRouteRequest,
        AddRouteResponse,
        async (req): Pmr<AddRouteResponse> => {
            // ...
        },
    ),
);
```

Her bliver den så brugt i backend serveren. Vi kører den igennem vores
middleware som er i det vi kalder 'parse'. Vores middleware validere at både
requesten og responsen matcher typen.

```ts
// app/src/Server.ts
export interface AuthorizedServer extends UnauthorizedServer {
    addRoute(
        request: Forget<AddRouteRequest, "token">,
    ): Promise<Result<void, string>>;
    // ...
}
```

Her bliver den brugt i web-appen. Dette er et interface der beskriver hvad
addRoute metoden skal bruge og hvad den returnere. Her bliver AddRouteRequest
også brugt.

Det skaber en sikkerhed i at vores backend server og vores web-app kommunikere i
samme sprog.

[^1]: https://github.com/mtkonge/avarts
