# intnet-projekt
**Martin Fagerlund och Adam Melander**

För att hjälpa er vid bedömming i dessa extraordinära tider tänkte vi att vi kan bidra med lite vägledning i vår kod. Samt pinpointa vissa delar av vår kod som hör till specifika krav för projektet.

### Översikt
Vi har alltså gjort en förenklad verision av Google Keep, Goggle Cheap. I huvudsak består den av 3 olika sidor. 
1. Loginsidan
2. Registrera
3. Profilsidan

De två förstnämnda är relativt enkla på klientsidan med inputfält och knappar som huvudsakliga element. Profilsidan är lite mer avancerad och innehåller flera olika tekniker och verktyg.

Klientsidan är byggd i Vue medan vi på serversidan har använt nodejs som huvudsakligt programmeringsspråk. För databaslagring använder vi sqlite och sequelize. Sequelize är en promise baserad ORM(Object-Relational Mapping) och hjälper oss på flera olika sätt, bland annat genom att inte behöva skriva egna queries samt så medför Sequelize ett grundläggande skydd mot SQL-injections.

### Funktioner
Från loginsidan som också agerar startsida så kan man antingen logga in eller registrera en ny användare. Vid inloggning så blir man vidareskickad till profilsidan. På profilsidan har man alla sina todo-cards och listor som man själv skapar.

Högst upp i mitten av profilsidan är rutan där man skapar nya todos eller listor. Genom att bläddra i menyn mellan "add todo" och "add list" ändras möjligheterna litegranna. Om man lägger till en ny todo kan man ge den en titel och en beskrivning. Om man istället lägger till en lista så lägger man själv till valfritt antal list element och det gör man genom att trycka på enter när man skrivit färdigt vad raden ska innehålla. Därifrån kan man ta bort redan tillagda listrader eller trycka på Done för att spara listan.

För todos så kan man redigera dem genom att trycka på Edit och skriva om dem samt ta bort dem genom delete knappen. För listor kan man bocka av saker genom kryssrutorna och ta bort listan men inte redigera innehållet.

Högst upp i högra hörnet under User kan man logga ut och komma tillbaka till login sidan.

### Specifika krav
##### E-nivå
**Ert projekt implementerar ett grundläggande "percistance-layer", med cookies och SQLite**

Vi använder npm express för sessions hantering och sparar ett slumpat sessionID vid login. Se auth.api.js rad 110.
Vår data lagras med sqlite samt Sequelize. Där sparar vi all användar information så som användarnamn och lösenord.
Se rad 9 db.js för sqlite dialect. Samt request /authenticate i auth.api.js.


**Ert projekt skall implementera "gate":ade endpoints, p.s.s. som ni gjorde i labb 3 för t.ex. "/profil" sidan**

I router/index.js kollas det om sessionen från requesten redan är inloggad eller om den försöker nå sidor den inte är auktoriserad för. I router så görs det ett request till auth.api.js /checksession, det den gör är att se om det finns ett sessioID kopplat till den sessionen. Om det gör det så ser vi om det finns en inloggad användare som överensstämmer med det sessionID. Om det finns en sådan användare så får den ta sig till profilsidan. 
Vi sköter all logik kopplat till auktorisering i auth.api.js samt model.js. auth.api.js tar emot requestet medan det i model.js finns funktioner för att hitta användare det är också där vår mappning av användare och sessionIDs sker.


**Ni skall visa grundläggande kunskaper om Javascript, HTML och CSS**

Kolla valfri Vue fil. Vi använder ibland olika tekniker för att lösa samma problem detta för att det finns väldigt många olika sätt att programmera samma sak och vi har lärt oss nya tekniker under projektets gång.


**Ni skall visa grundläggande förståelse för relationen mellan klient och server**

Svårt att peka på något exakt exempel men tycker att vi i det stora hela hanterar de två olika sidorna på ett adekvat sätt. Vi skickar data mellan server och klient, vi hanterar "redirecting" av klienten på klient sidan men med auktorisering på serversidan osv. Det finns en del optimeringar man skulle kunna utföra vid uppskallning för att minska antalet request till servern men vi ansåg inte att prestanda låg i uppgiftens huvudsakliga scope.


**Ert projekt skall inte vara sårbart för SQL-injections**

Som tidigare nämnt så använder vi Sequelize som i sig kommer med ett skydd mot SQL injections då den inte använder hårdkodade queries där man skulle kunna stoppa in potentiellt farlig kod. Se db.js samt profile.api.js för exempel på hur vi kommunicerar med vår databas.

##### C-nivå
**Ert projekt skall implementera saltning & hashning av lösenord**

Vi använder oss av node modulen bcrypt för att skapa salt och encryptera lösenorden tillsammans med salten. Både saltet och det encrypterade lösenordet sparas i databasen så att när användare anger ett lösenord som ska jämföras kan vi:
* Hämta det sparade saltet
* Lägga till det på lösenordet 
* Encrypera det igen med saltet
* Se om det matchar med det encrypterade lösenordet i databasen.

**Ert projekt får inte vara sårbar för XSS attacker**

Genom att implementera node modulen "helmet" skyddar vi oss mot XSS attacker genom att inte tillåta kod från okända källor. 


**Ert projekt skall implementera aktiv session invalidering. T.ex. user logout**

För att hålla koll på alla sessions så kopplar vi alla inloggningar till ett nytt user objekt. I detta objekt har vi en lista med alla sockets kopplade till den sessionen. Detta gör det möjligt att bli auto inloggad i flera tabs men samtidigt ta emot individuella emits vilket används vid logout. När man loggar ut antingen genom att klienten loggar ut eller att man blir kickad pga idling så vill vi att man blir utloggad på alla sockets som är kopplade till samma session så vi loopar igenom listan med sockets och skickar ett emit att timeout är nådd och att man blir utloggad.
Se kod model.js funktioner emitToAllSockets() och deleteUser(). Samt request /logout i profile.api.js. Emitet hanteras i Profile.Vue på klientsidan som i sin tur gör ett emit till App.vue för att fullborda utloggningen på klientsidan.


**Ert projekt skall servera en klienten som skall vara byggd som en SPA**

Se App.Vue rad 27 router-view, där hamnar alla vår Vue komponenter. Vilken som visas beror på vilket state vi är i routern.


##### A-nivå
**Ert projekt skall implementera SSL / HTTPS, med antingen "self-signed" certifikat som ni gjorde i labb 5x, eller med "ca-signed" certifikat (se "ngrok" tillsammans med "Let's Encrypt")**

Vi skapade ett self-signed certifikat via openssl, se cert.pem och key.pem. 

I index.js på server sidan när vi skapar servern så är det lite annorlunda gentemot http. Vi behöver ge pathen till både certifikatet och nyckeln vid skapandet samt passphrasen behöver vara korrekt. Se rad 54 index.js. 


**Ert projekt skall implementera passiv sessions invalidering. Både genom "timeout detection" samt genom "cookie theft detecting" (samma session får inte komunicera med servern från flera olika IP addresser)**

När en användare loggar in kallas funktionen updateSession i model.js som sätter igång och kopplar en timer till denna användare. När tiden nås kommer användaren att "automagiskt" loggas ut. Men vi vill ju inte att en användare ska loggas ut om den fortfarande håller på med saker på hemsidan så i profile.api.js rad 19 har vi en middleware som nås vid varje request. Och om det är en registrerad användare som gjort requestet så kommer denna timer nollställas och börja om. Så man blir bara utloggad om är inaktiv för lång tid. 

För att förhindra att samma sessionID används på flera olika ip adresser så kopplar vi användarens ip address till våra User objekt. Och i vår funktion /checksession i auth.api.js kontrolleras det att ip adressen stämmer överenns. Detta förhindrar att man kan sno någons sessionID cookie och använda på någon annan dator. 


**Ert projekt skall inte förlora applikationsdata efter en server omstart & eller en server krasch. Detta förväntas göras genom användning av de "persistent storage" metoder som lärts ut i kursen**

Alla förändringar som sker på klientsidan skickas till servern för att sparas så fort som användaren lägger till något nytt. Alla checkboxar förändringar skickas också till servern på knapptryck.


**Ert projekt skall använd websockets på minst ett sätt, samt enbart där det är logiskt**

Vi har varit inne på det lite tidigare men vi använder sockets för att kicka ut alla sockets som är kopplade till samma sessionID. Så vid logout så gör vi ett emit till alla sockets och loggar ut alla connections med samma sessionID. Vid socket disconnection vill vi också ta bort denna från User objektets socketlista. Detta sker på rad 147 i index.js och 102 i model.js

Socket connection hanteras i index.js, rad 120, där lägger vi till sockets i oregistrerade eller kopplar dem till User objekt. Och på klientsidan så hanteras socket emits i Profile.Vue mounted(). Som i sin tur gör ett emit till $root, alltså App.Vue, för att logga ut klienten därifrån.
