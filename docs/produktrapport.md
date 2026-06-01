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

Todo: beskriv results

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

### User auth

## Backend server

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
enten 'bad_user' eller 'db_error'. Dette kan vi parse på, når vi bruger metoden
i vores ruter.

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
backenden kører på ikke har nok ressourcer. Vi er opmærksomme på dette problem,
da vi lavede det og det har været dels grunden til at vi har lavet database
interfaces, så man nemt kan se, hvad en database skal kunne. Dette gør det nemt
at implementere interfaces som f.eks. en sql database.

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
