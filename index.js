/**
 * @typedef Party
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} date
 * @property {string} location
 */

/**
 * @typedef Guest
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef RSVP
 * @property {number} eventId
 * @property {number} guestId
 */

// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "2506-Angel";
const EVENTS_API = `${BASE}/${COHORT}/events`;
const GUESTS_API = `${BASE}/${COHORT}/guests`;
const RSVPS_API = `${BASE}/${COHORT}/rsvps`;

// === State ===
let parties = [];
let selectedParty = null;
let guests = [];

// === API ===

async function getParties() {
  try {
    const response = await fetch(EVENTS_API);
    const result = await response.json();
    parties = result.data;
    render();
  } catch (error) {
    console.error(error);
  }
}

async function getParty(id) {
  try {
    const response = await fetch(`${EVENTS_API}/${id}`);
    const result = await response.json();
    selectedParty = result.data;
    await getGuests();
    render();
  } catch (error) {
    console.error(error);
  }
}

async function getGuests() {
  try {
    const [guestsRes, rsvpsRes] = await Promise.all([
      fetch(GUESTS_API),
      fetch(RSVPS_API)
    ]);
    const guestsData = await guestsRes.json();
    const rsvpsData = await rsvpsRes.json();

    const rsvpsForSelected = rsvpsData.data.filter(
      (rsvp) => rsvp.eventId === selectedParty.id
    );
    const guestIds = rsvpsForSelected.map((rsvp) => rsvp.guestId);

    guests = guestsData.data.filter((guest) => guestIds.includes(guest.id));
  } catch (error) {
    console.error(error);
  }
}

// === Components ===

function PartyListItem(party) {
  const li = document.createElement("li");
  const a = document.createElement("a");

  a.href = `#party-${party.id}`;
  a.textContent = party.name;

  a.addEventListener("click", () => getParty(party.id));

  li.appendChild(a);
  return li;
}

function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("lineup");

  const $items = parties.map(PartyListItem);
  $ul.replaceChildren(...$items);

  return $ul;
}

function PartyDetails() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to view its details.";
    return $p;
  }

  const $section = document.createElement("section");
  $section.classList.add("party");
  $section.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <p>${selectedParty.date}</p>
    <p><em>${selectedParty.location}</em></p>
    <p>${selectedParty.description}</p>
    <ul>
      ${guests.map((g) => `<li>${g.name}</li>`).join("")}
    </ul>
  `;
  return $section;
}

// === Render ===

function render() {
  const $app = document.querySelector("#app");

  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <div id="party-list"></div>
      </section>
      <section>
        <h2>Party Details</h2>
        <div id="party-details"></div>
      </section>
    </main>
  `;

  $app.querySelector("#party-list").appendChild(PartyList());
  $app.querySelector("#party-details").appendChild(PartyDetails());
}

getParties();
