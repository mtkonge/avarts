# Processrapport

## Indledning

Som forberedelse til svendeprøven idegenerede vi for ikke at skulle bruge
dyrebare tid i forløbet på det. Derfor var idéen allerede på plads da forløbet
startede.

Måden vi fik idéen på var at Mikkel var startet med at køre på longboard og han
syntes det kunne være fedt at kunne konkurrere mod hinanden på bakker vi plejer
at køre (Theis kører også på longboard). Her kom idéen, vi fandt dog ud af at
appen allerede eksisterede ved navnet Strava. Dog kostede de features vi gerne
ville have fra appen penge. Vi vurderede at det kunne være relevant og spændende
at arbejde med til svendeprøven.

## 04/05 - 05/05

Her brugt vi en del tid på at undersøge hvilke værktøjer vi ville bruge til
geolocation og visningen af et kort. Vi fandt ud af at browseren har et
geolocations API, så den prøvede vi og fik det til at virke. Herefter fandt vi
pakken 'maplibre-js'. Denne pakke havde vi ikke prøvet før. Vi havde prøvet
andre kort API'er før, og fandt hurtigt ud af at det lignede det vi kendte. Her
fik vi så sat kortet op og placeret en marker der hvor geolocationen var og
opdateret den konstant.

## 06/05 - 07/05

Her begyndte vi på at sætte en backend server op. Vi bestemte os for at bruge
oak, da det lignede express som vi kendte godt. Derefter valgt vi at vores
database skulle være json filer da det var simpelt. Vi endte ud med at få lavet
et generelt setup hvor der blev lavet endpoints: route by id, add route og
routes.

Så fik vi også lavet forbindelsen til frontenden og oprettet de 3 endpoints
deri. Vi fandt ud af at det kunne være smart at de typer backenden bruger (type
definitionen af Routes, AddRouteRequest, AddRouteResponse osv.) også var
tilgængelige for frontenden. Derfor vurderede vi at vi skulle bruge et monorepo
setup hvor vi lavede en tredje mappe 'shared' hvor de delte typer var defineret.
Det virkede fint på backenden, men efter en del bøvl med Vite (vores frontend's
build system) konkluderede vi at vi nok skulle prøve at bruge noget andet end
Vite.

## 08/05

Her fjernede vi Vite fra vores projekt. Theis havde nogle scripts han havde
brugt før til at bygge hans typescript. Vi prøvede dem af og rettede lidt i dem
og fik det til at virke. Det var ikke perfekt, nogle gange var man nød til at
genstarte script'sne for at fileren blev bygget, men vi vurderede at det var
godt nok.

Her fik vi også implementered user autorisering på backenden.

## 11/05 - 12/05

## 13/05

## 18/05

## 19/05 - 21/05

## 22/05

## 26/05

## 27/05

## 01/06
