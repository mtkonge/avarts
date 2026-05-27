# Avarts

_Mikkel Kongsted &lt;mtkongsted@gmail.com&gt;, Theis Pieter Hollebeek
&lt;tphollebeek@gmail.com&gt; - 26.5.2026_

Avarts er en web-app, hvor en bruger kan oprette og køre ruter. Brugeren kan
konkurrere med andre brugere med sit eget transportmiddel ved at prøve at for
den bedste tid på en given rute indenfor det transportmiddel.

Løsningen består af en web-app med et verdenskort og en backend server der
kommunikere over HTTP sammen med web-appen. Udover det har vi også et shared
mappe der beskriver typer og funktioner både backend server og web-appen bruger.

Koden og andre relevante materialer ligger på Github repo'et [^1]

## Web-appen

Web-appen er implementeret med HTML, CSS og Typescript. Vi har brugt Deno som
Typescript/Javascript runtime og bruger vores egne scripts, der bruger esbuild
til at bygge appen. Vi har brugt maplibre-gl til at verdenskortet.

Vi har valgt at skrive appen i Typescript, CSS og HTML. Vi har valgt Typescript
da vi har brugt det meget før. En af de største grunde er hvor nemt man kan
integrere Typescript scripts til hjemmesider da der er bygget på Javascript. Vi
har valgt typescript i stedet for Javascript, da vi er glade for typer. Vi kan
godt lide den sikkerhed der er i at vide typerne af variabler, funktion m.m. på
forhånd. (ret dårligt skrevet burde skrives om)

Vi har valgt at bruge Deno, da vi vurdere, at det er et bedre alternativ til
Node. Vi mener at måden Deno håndtere pakker, er mere intuitiv end måden Node
bruge det.

Vi har valgt at bygge vores egne scripts med esbuild, da det giver os mere
frihed. Vi startede med at bruge Vite, men dette fandt vi ud af gav problemer
når man brugte et monorepo setup. I det vi begyndte at bruge shared mappen til
deling af typer of funktioner til både backenden og appen skiftede vi til vores
egne scripts. Vi har brugt disse scripts i andre projekter før. (måske forklar
hvorfor at man ikke bare kan bruge deno runtimen, direkte og man er nød til at
bruge de compilerede Typescript filer (altså Javascript))

Vi har valgt at bruge maplibre-gl da det har Typescript support. Udover det har
det alle de funktioner vi har brug for så som rotation af korten, tegner linjer
på korten, zoom ind og ud.

### Oprettelse af rute

### Kørelsen af et 'run'

### Leaderboard og profil

### Forbindelsen til backend serveren

### User auth

## Backend server

Backend serveren er også skrevet skrevet i Typescript med deno. Her kører vi
Typescript filerne direkte med Deno. Vi bruger Oak til at håndtere vores http
requests og middleware. Til kryptering af passwords bruger vi bcrypt. Vores
database er json filer.

Vi har valgt at bruge Typescript da det har typer og vi har brugt det mange
gange før til at lave backend servere med. Vi har valgt at bruge Oak da det
ligner andre frameworks som Express. Da vi har brugt Express mange gange før var
det nemt og forståeligt at bruge. Vi har brugt Bcrypt da det er et populært
værktøj til kryptering. Det er vigtigt at man vælge krypteringsværktøjer man kan
stole på og siden at Bcrypt er en industri-standard for kryptering, vurdere vi
at det er sikkert.

### Database

### Business logic

### Ruter

### Sessions

## Delte typer i mellem web-app og backend

En af de første problemer vi opdagede var at typerne backenden også skulle
bruges på frontenden. For eksempel hvordan en rute så ud, men også hvordan
requests og responses til og fra backenden så ud. For at undgå at skulle skrive
disse typer 2 gange og at det muligvis vil opstå fejl hvis man glemmer at
opdatere begge steder, har vi valgt at lave en mappe i vores projekt der hedder
'shared'. Her har vi beskrevet typer og funktioner, vi bruger i hele vores
projekt.

Forklar brugen er pakken 'zod'

Vis eksempel

[^1]: https://github.com/mtkonge/avarts
