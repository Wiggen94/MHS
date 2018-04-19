# MHS

Dette er et prosjekt som omhandler å skape et system for administrering av arrangementer og vakter

## Kom i gang

Disse instruksjonene vil hjelpe deg med å komme i gang med MHS på din lokale maskin for utvikling og testing.

Instruksjoner for å sette opp MHS i et live-miljø vil komme senere.

### På forhånd

På forhånd må du ha installert Homebrew(for mac) og nodejs.

På Windows installerer du nodejs ved å laste ned fra
https://nodejs.org/en/

På Mac åpner du terminal og skriver følgende
```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

```
Deretter skriver du følgende i terminal
```
brew install node

```


### Installere

For å sette opp et utviklermiljø på din egen datamaskin gjør du følgende

```
Last ned repository fra denne GitHuben
Åpne kommandovinduet ditt å bruk cd "%STINAVN%" for å komme til riktig mappe
For eksempel "cd C:\Users\USERNAME\master".
```
Når du har kommet inn i riktig mappe må vi installere alle avhengigheten til nodejs for å kjøre prosjektet

```
WINDOWS:
Skriv npm install i kommandovinduet
Bruk "npm run dev" for å kjøre server.js

MAC:
Skriv sudo npm install i terminal etterfulgt av ditt passord.
Bruk "npm run dev" for å kjøre server.js
```
HVIS BRUKEREN DIN IKKE KOMMER OPP ETTER AT DU HAR REGISTRERT ELLER DU FÅR FEILMELDING ETTER REGISTRERING SÅ AVSLUTT
PROGRAMMET OG KJØR "NPM RUN DEV" PÅ NYTT.


For å vise klientsiden av programmet kan du enten gå til
http://localhost:8080

Eller du kan bruke nativefier for å opprette en kjørbar fil ved å skrive følgende i kommandovinduet

```
nativefier http://localhost:8080
```

Du skal etter dette ha fått en ny mappe som heter noe lignende som "APP-win32-x64", denne mappen vil ha noe annet navn på OS X.
I denne mappen er det en fil som heter App som vil kjøre prosjektet som et program istedenfor en nettside ved å bruke electronjs.
## Oppsett

Kommer senere
