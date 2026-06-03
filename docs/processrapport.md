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
definitionen af Routes, RoutesRequest, RoutesResponse osv.) også var
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

Her opdagede vi at når man startede appen tog det noget tid for kortet at load.
Derfor tænkte vi at vi skulle have en form for loading skærm. Theis synes det
kunne være fedt at lave nogle ASCII art animationer og jeg fik idéen at vores
loading skulle være et transportmiddel der bevæger sige. Derfor lavede Theis 3
animationer, en person der løber, en person der cykler og en person på
skateboard.

Her fik vi også hostet web-appen, så vi kunne teste appen på mobilen. Derudover
gjorde vi sådan, at man kunne får kortet til at rotere med mobilens kompas.
Backenden fik et nyt endpoint add route, og vi designede en toolbar til
frontenden.

## 13/05

Vi lavede en mekanisme til at kunne optage et run på frontend. Vi implementerede
run endpoints på backend serveren.

Her brugte vi også en del tid på at refaktorere vores nuværende kode.

## 18/05

Her fik vi refaktoreret vores backend til ikke at indblande business logik i
vores endpoints. Dette valgte vi at gøre for at skabe mere abstraktion. Dette
gør det nemmere at udvikle i backenden i fremtiden.

## 19/05 - 21/05

Her fik vi implementeret endpoint'et på backenden serveren runs on route,
hvilket giver os alle runs på en rute.

Her gjorde vi det muligt for brugeren at trykke på en rute. Dette viser en popup
hvor man kan starte et run. Her vil man så kunne se de bedste tider for ruten.

## 22/05

Her fik vi lavet brugerprofil. Her kan man se sine bedste runs og runs man har
kørt for nylig.

## 26/05

Her fik vi tilføjet sådan at man kan starte runs med forskellige
sportskategorier (rulleskøjter, cykel, osv). Nu kan man også navngive ruter man
laver. Vi fikgi også tilføjet en knap til brugerprofil på toolbaren og en knap
til at logge ud.

Vi fik også lavet leaderboard. Når man trykker på en rute kan man nu enten
starte et run eller se leaderboardet for det run. Man kan på leaderboardet
filtrere efter din sportskategori

## 27/05

## 01/06
