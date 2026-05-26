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

Vi har valgt at skrive appen i Typescript, CSS og HTML (bla bla hvorfor?)

Vi har valgt at bruge Deno da ( ... )

Vi har valgt at bygge vores egne scripts med esbuild, da det giver os mere
frihed. Vi startede med at bruge Vite, men dette fandt vi ud af gav problemer
når man brugte et monorepo setup. I det vi begyndte at bruge shared mappen til
deling af typer of funktioner til både backenden og appen skiftede vi til vores
egne scripts. Vi har brugt disse scripts i andre projekter før. (måske forklar
hvorfor at man ikke bare kan bruge deno runtimen direkte og man er nød til at
bruge de compilerede Typescript filer (altså Javascript))

Vi har valgt at bruge maplibre-gl da det har Typescript support. Udover det har
det alle de funktioner vi har brug for så som rotation af korten, tegner linjer
på korten, zoom ind og ud.

## Backend server

Backend serveren er også skrevet skrevet i Typescript med deno. Her køre vi
Typescript filerne direkte med Deno.

[^1]: https://github.com/mtkonge/avarts
